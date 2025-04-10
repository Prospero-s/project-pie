import os
import json
import logging
import base64
from typing import Dict, List, Any, Optional
import tempfile
from pathlib import Path

import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import openai
from openai import OpenAI

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialisation du client OpenAI
# Assurez-vous que OPENAI_API_KEY est défini dans vos variables d'environnement
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def convert_pdf_to_images(pdf_path: str, output_folder: str) -> List[str]:
    """
    Convertit un fichier PDF en images.
    
    Args:
        pdf_path: Chemin vers le fichier PDF
        output_folder: Dossier de sortie pour les images
        
    Returns:
        Liste des chemins des images générées
    """
    logger.info(f"Conversion du PDF {pdf_path} en images")
    
    # S'assurer que le dossier de sortie existe
    os.makedirs(output_folder, exist_ok=True)
    
    # Obtenir le nom de base du fichier
    pdf_filename = os.path.basename(pdf_path)
    base_filename = os.path.splitext(pdf_filename)[0]
    
    # Convertir le PDF en images
    try:
        pages = convert_from_path(pdf_path, dpi=300)
    except Exception as e:
        logger.error(f"Erreur lors de la conversion PDF->Image avec pdf2image: {e}")
        raise
    
    image_paths = []
    
    for i, page in enumerate(pages):
        # Utiliser JPEG pour potentiellement réduire la taille vs PNG pour l'envoi API
        image_path = os.path.join(output_folder, f"{base_filename}_page_{i+1}.jpg")
        try:
            page.save(image_path, "JPEG")
            image_paths.append(image_path)
            logger.info(f"Page {i+1} sauvegardée: {image_path}")
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde de l'image {image_path}: {e}")
            # Continuer si possible avec les autres pages
    
    if not image_paths:
        raise ValueError("Aucune image n'a pu être générée à partir du PDF.")
        
    return image_paths

def encode_image_to_base64(image_path: str) -> str:
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Erreur lors de l'encodage de l'image {image_path}: {e}")
        return ""

def analyze_images_with_gpt(image_paths: List[str], requested_language: str = 'en') -> Dict[str, Any]:
    """
    Analyse une liste d'images (pages PDF) avec GPT Vision pour extraire les données financières.
    Args:
        image_paths: Liste des chemins vers les images des pages.
        requested_language: Langue souhaitée pour la sortie (ex: 'fr', 'en').
    Returns:
        Dictionnaire contenant les données financières extraites.
    """
    logger.info(f"Analyse de {len(image_paths)} images avec GPT Vision (Langue: {requested_language})")

    # Limiter le nombre d'images par appel API si nécessaire (ex: 10)
    # Pour cet exemple, on envoie tout, mais attention aux limites de tokens/coûts
    MAX_IMAGES_PER_CALL = 20 # Ajustez selon les limites et les tests
    if len(image_paths) > MAX_IMAGES_PER_CALL:
        logger.warning(f"Le nombre d'images ({len(image_paths)}) dépasse la limite fixée ({MAX_IMAGES_PER_CALL}). Tronquage.")
        image_paths = image_paths[:MAX_IMAGES_PER_CALL]

    try:
        # Déterminer la langue de la réponse souhaitée
        output_language = "French" if requested_language == 'fr' else "English"

        system_prompt = f"""
        You are an expert financial analyst specialized in extracting data from financial documents (provided as images).
        Your role is to accurately extract key financial information according to the specified categories, based *only* on the content visible in the images.
        Respond *only* with a valid, well-structured JSON object.
        **Generate any textual summaries or table titles requested in the user prompt in {output_language}.**
        """

        # Définir le template du prompt utilisateur SANS interpolation f-string directe
        user_prompt_template = """
        Analyze the content of the following images, specifically focusing on tables containing financial metrics.
        Identify the main financial table(s). For the most prominent table, extract the data row by row.
        Use the exact row label (from the first column) as the primary key for each KPI.
        For each KPI, create a nested object where the keys are the **actual column headers visible in the table image** (e.g., "Q1", "Q2", "YTD", "FY 2023", "NOV A24", "Fcst", etc.) and the values are the corresponding cell contents.
        Return ONLY a valid, well-structured JSON object like the example below.

        JSON Structure Example:
        {{{{
          "date": "Overall period if identifiable, e.g., Q3 2024",
          "kpis": {{{{
            "KPI Name from Row 1": {{ "Header 1": "Value1", "Header 2": "Value2", ... }},
            "KPI Name from Row 2": {{ "Header 1": "ValueA", "Header 2": "ValueB", ... }},
            ...
          }}}},
          "autres_indicateurs": {{{{
             "summary": "Brief text summary (in {lang}) if applicable.",
             "tables": [ {{ "title": "...", "summary": "..." }} ]
          }}}}
        }}}}

        Instructions:
        - Base extraction *solely* on the visual content.
        - Extract data for *all* rows found in the main financial table.
        - Use the exact labels from the first column of the table as keys in the "kpis" object.
        - Use the exact column headers from the table as keys for the nested value objects.
        - If a cell value is empty or not applicable in the image, use null.
        - Keep amounts with their units (m, %, x, K€, M€, $, etc.) exactly as seen.
        - Provide summaries or table descriptions in 'autres_indicateurs' in {lang}.
        - Ensure the final output is a single, valid JSON object.
        """
        # Formater le template avec la langue
        user_prompt_text = user_prompt_template.format(lang=output_language)

        # Construction du message pour l'API Vision
        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt_text}
                    # Ajouter les images encodées
                ]
            }
        ]

        # Encoder et ajouter chaque image au message utilisateur
        for image_path in image_paths:
            base64_image = encode_image_to_base64(image_path)
            if base64_image:
                messages[1]["content"].append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                })
            else:
                logger.warning(f"Impossible d'encoder ou d'ajouter l'image: {image_path}")
        
        if len(messages[1]["content"]) <= 1: # Si aucune image n'a pu être ajoutée
             raise ValueError("Aucune image valide à envoyer à l'API.")

        # Appel à l'API OpenAI
        response = client.chat.completions.create(
            model="chatgpt-4o-latest", # Modèle Vision
            messages=messages,
            response_format={ "type": "json_object" },
            max_tokens=4000, # Augmenter potentiellement les tokens pour l'analyse d'images
            temperature=0.1 # Température basse pour une extraction factuelle
        )

        result_text = response.choices[0].message.content
        result = json.loads(result_text)

        return result

    except openai.APIError as e:
        logger.error(f"Erreur API OpenAI: {e}")
        return {"error": f"OpenAI API Error: {e}"}
    except json.JSONDecodeError:
        logger.error(f"Erreur de décodage JSON de la réponse OpenAI: {result_text}")
        return {"error": "Failed to decode JSON response from OpenAI"}
    except Exception as e:
        logger.error(f"Erreur inattendue lors de l'analyse des images avec GPT: {e}")
        return {"error": f"Unexpected error during image analysis: {e}"}

def process_pdf(pdf_path: str, output_folder: str, requested_language: str = 'en') -> Dict[str, Any]:
    """
    Traite un fichier PDF en convertissant en images et en analysant les images avec GPT Vision.
    Args:
        pdf_path: Chemin vers le fichier PDF.
        output_folder: Dossier de sortie.
        requested_language: Langue demandée pour l'analyse.
    Returns:
        Dictionnaire contenant les données financières extraites et les URLs des images.
    """
    logger.info(f"Traitement du PDF {pdf_path} via analyse d'images (Langue: {requested_language})")

    image_paths_internal = []
    processing_id = os.path.splitext(os.path.basename(pdf_path))[0]
    result_data = {"error": "Initialization error", "image_urls": []} # Default error

    try:
        # Étape 1: Convertir le PDF en images
        image_paths_internal = convert_pdf_to_images(pdf_path, output_folder)

        # Étape 2: Analyser les images avec GPT Vision
        extracted_data = analyze_images_with_gpt(image_paths_internal, requested_language)

        # Étape 3: Préparer les chemins web-accessibles
        image_filenames = [os.path.basename(p) for p in image_paths_internal]
        image_urls_web = [f"/processed_images/{fname}" for fname in image_filenames]

        # Étape 4: Sauvegarder les résultats (optionnel)
        result_file_path = os.path.join(output_folder, f"{processing_id}_vision_results.json")
        try:
            full_result_to_save = {
                "extracted_data": extracted_data,
                "image_urls_web": image_urls_web # Sauvegarde URLs pour référence
            }
            with open(result_file_path, "w", encoding="utf-8") as f:
                json.dump(full_result_to_save, f, ensure_ascii=False, indent=2)
            logger.info(f"Résultats sauvegardés: {result_file_path}")
        except Exception as e:
            logger.error(f"Impossible de sauvegarder les résultats JSON: {e}")

        # Préparer la réponse finale
        result_data = {
            "extracted_data": extracted_data,
            "image_urls": image_urls_web,
            "processing_id": processing_id # Retourner l'ID ici aussi
        }
        # Ajouter un warning s'il y en avait un dans extracted_data
        if isinstance(extracted_data, dict) and "error" in extracted_data:
            result_data["processing_warning"] = extracted_data["error"]

    except Exception as e:
         logger.error(f"Erreur globale lors du traitement du PDF {pdf_path}: {e}", exc_info=True)
         result_data = {"error": f"Failed to process PDF via image analysis: {e}", "image_urls": [], "processing_id": processing_id}

    return result_data

def safe_delete(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        logger.warning(f"Impossible de supprimer le fichier {path}: {e}") 