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
    logger.info(f"Conversion du PDF {pdf_path} en images dans {output_folder}")
    
    # Vérifier les chemins complets
    abs_pdf_path = os.path.abspath(pdf_path)
    abs_output_folder = os.path.abspath(output_folder)
    
    logger.info(f"Chemins absolus: PDF={abs_pdf_path}, Dossier={abs_output_folder}")
    
    # S'assurer que le dossier de sortie existe avec les bonnes permissions
    os.makedirs(abs_output_folder, exist_ok=True)
    try:
        os.chmod(abs_output_folder, 0o777)  # Essayer d'assurer des permissions totales
    except Exception as e:
        logger.warning(f"Impossible de modifier les permissions du dossier {abs_output_folder}: {e}")
    
    # Vérifier que le PDF existe
    if not os.path.exists(abs_pdf_path):
        logger.error(f"Le fichier PDF n'existe pas: {abs_pdf_path}")
        raise FileNotFoundError(f"PDF non trouvé: {abs_pdf_path}")
        
    # Obtenir la taille du fichier et les métadonnées
    pdf_size = os.path.getsize(abs_pdf_path)
    logger.info(f"Fichier PDF à convertir: {abs_pdf_path} ({pdf_size} octets)")
    
    # Obtenir le nom de base du fichier
    pdf_filename = os.path.basename(abs_pdf_path)
    base_filename = os.path.splitext(pdf_filename)[0]
    
    # Vérifier le contenu du dossier de sortie avant la conversion
    try:
        output_contents = os.listdir(abs_output_folder)
        logger.info(f"Contenu du dossier avant conversion: {output_contents}")
    except Exception as e:
        logger.warning(f"Impossible de lister le contenu du dossier {abs_output_folder}: {e}")
    
    # Stratégie 1: Utiliser une méthode simple mais robuste de conversion
    logger.info(f"Tentative de conversion avec méthode simple")
    
    try:
        # Convertir le PDF en images avec méthode de base
        pages = convert_from_path(abs_pdf_path, dpi=200)  # Utiliser une résolution plus basse pour éviter les problèmes de mémoire
        logger.info(f"PDF converti en {len(pages)} pages (mémoire)")
        
        # Sauvegarder chaque page comme image
        image_paths = []
        for i, page in enumerate(pages):
            image_filename = f"{base_filename}_page_{i+1}.jpg"
            image_path = os.path.join(abs_output_folder, image_filename)
            
            try:
                page.save(image_path, "JPEG", quality=85)  # Qualité un peu réduite pour la performance
                logger.info(f"Page {i+1}/{len(pages)} sauvegardée: {image_path}")
                
                # Vérifier que l'image a été créée
                if os.path.exists(image_path):
                    img_size = os.path.getsize(image_path)
                    logger.info(f"Image créée: {image_path} ({img_size} octets)")
                    image_paths.append(image_path)
                else:
                    logger.error(f"ÉCHEC: Image non créée: {image_path}")
            except Exception as e:
                logger.error(f"Erreur lors de la sauvegarde de l'image {image_path}: {e}", exc_info=True)
        
        # Vérifier les résultats
        if not image_paths:
            logger.error("ÉCHEC: Aucune image créée avec la méthode simple")
            raise ValueError("Aucune image créée avec la méthode simple")
            
        logger.info(f"Conversion réussie avec méthode simple: {len(image_paths)} images créées")
        return image_paths
            
    except Exception as main_error:
        logger.error(f"Échec de la méthode simple: {main_error}", exc_info=True)
        
        # Tenter une stratégie alternative
        logger.info(f"Tentative de conversion avec méthode alternative")
        try:
            # Utiliser un fichier temporaire comme intermédiaire
            import tempfile
            with tempfile.TemporaryDirectory() as temp_dir:
                logger.info(f"Utilisation du dossier temporaire: {temp_dir}")
                
                # Copier le PDF dans le dossier temporaire
                temp_pdf = os.path.join(temp_dir, "temp.pdf")
                import shutil
                shutil.copy2(abs_pdf_path, temp_pdf)
                logger.info(f"PDF copié dans: {temp_pdf}")
                
                # Convertir le PDF en images dans le dossier temporaire
                temp_output = os.path.join(temp_dir, "output")
                os.makedirs(temp_output, exist_ok=True)
                
                # Utiliser une commande système si disponible
                if shutil.which("pdftoppm"):
                    logger.info("Utilisation de pdftoppm (commande système)")
                    import subprocess
                    try:
                        cmd = ["pdftoppm", "-jpeg", "-r", "150", temp_pdf, os.path.join(temp_output, "page")]
                        subprocess.run(cmd, check=True)
                        logger.info("Conversion pdftoppm terminée")
                    except subprocess.SubprocessError as e:
                        logger.error(f"Erreur pdftoppm: {e}")
                        raise
                else:
                    # Utiliser pdf2image directement
                    logger.info("pdftoppm non disponible, utilisation de pdf2image")
                    pages = convert_from_path(temp_pdf, dpi=150, output_folder=temp_output, fmt="jpeg")
                    logger.info(f"Conversion pdf2image terminée: {len(pages)} pages")
                
                # Déplacer les images générées vers le dossier de sortie final
                temp_images = [f for f in os.listdir(temp_output) if f.lower().endswith(('.jpg', '.jpeg'))]
                logger.info(f"Images trouvées dans le dossier temporaire: {temp_images}")
                
                image_paths = []
                for i, temp_img in enumerate(sorted(temp_images)):
                    src_path = os.path.join(temp_output, temp_img)
                    dst_filename = f"{base_filename}_page_{i+1}.jpg"
                    dst_path = os.path.join(abs_output_folder, dst_filename)
                    
                    try:
                        shutil.copy2(src_path, dst_path)
                        if os.path.exists(dst_path):
                            img_size = os.path.getsize(dst_path)
                            logger.info(f"Image copiée: {dst_path} ({img_size} octets)")
                            image_paths.append(dst_path)
                        else:
                            logger.error(f"ÉCHEC: Image non copiée: {dst_path}")
                    except Exception as e:
                        logger.error(f"Erreur lors de la copie de {src_path} vers {dst_path}: {e}")
                
                # Vérifier les résultats
                if not image_paths:
                    logger.error("ÉCHEC: Aucune image créée avec la méthode alternative")
                    raise ValueError("Aucune image créée avec la méthode alternative")
                    
                logger.info(f"Conversion réussie avec méthode alternative: {len(image_paths)} images créées")
                return image_paths
                
        except Exception as alt_error:
            logger.error(f"Échec de la méthode alternative: {alt_error}", exc_info=True)
            raise ValueError(f"Toutes les méthodes de conversion ont échoué: {main_error} / {alt_error}")
    
    # Cette ligne ne devrait jamais être atteinte
    raise RuntimeError("Erreur inattendue dans la conversion PDF -> images")

def encode_image_to_base64(image_path: str) -> str:
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Erreur lors de l'encodage de l'image {image_path}: {e}")
        return ""

def extract_text_from_images(image_paths: List[str]) -> str:
    """
    Extrait le texte des images à l'aide d'OCR.
    """
    logger.info(f"Extraction du texte de {len(image_paths)} images par OCR")
    extracted_text = []
    
    for img_path in image_paths:
        try:
            img = Image.open(img_path)
            text = pytesseract.image_to_string(img, lang='fra+eng')
            extracted_text.append(text)
        except Exception as e:
            logger.error(f"Erreur OCR sur {img_path}: {e}")
            extracted_text.append(f"[Erreur OCR: {str(e)}]")
    
    return "\n\n".join(extracted_text)

def get_periods_from_periodicity(periodicity: str, year: str) -> List[str]:
    """
    Génère la liste des périodes en fonction de la périodicité.
    """
    if periodicity == 'Q':
        return [f"Q1 {year}", f"Q2 {year}", f"Q3 {year}", f"Q4 {year}"]
    elif periodicity == 'H':
        return [f"H1 {year}", f"H2 {year}"]
    elif periodicity == 'Y':
        return [f"{year}"]
    else:
        return []

def get_kpi_mapping(kpi_code: str, language: str) -> List[str]:
    """
    Mappe un code KPI à son nom complet et ses synonymes dans la langue spécifiée.
    Retourne une liste de noms possibles.
    """
    mappings = {
        'chiffre_affaire': {
            'fr': ["Chiffre d'affaires", "Revenu", "CA", "Ventes", "Recettes", "Net Bookings", "Revenus"],
            'en': ["Revenue", "Sales", "Turnover", "Net Bookings", "Income", "Gross Revenue"]
        },
        'marge_brute': {
            'fr': ["Marge brute", "Marge", "Résultat brut", "Bénéfice brut"],
            'en': ["Gross Margin", "Margin", "Gross Profit", "Operating Margin"]
        },
        'cout_acquisition': {
            'fr': ["Coût d'acquisition client", "CAC", "Coût d'acquisition", "Coût par client"],
            'en': ["Customer Acquisition Cost", "CAC", "Acquisition Cost", "Cost per Customer"]
        },
        'valeur_vie_client': {
            'fr': ["Valeur à vie client", "LTV", "CLV", "Valeur vie client", "VVC"],
            'en': ["Customer Lifetime Value", "LTV", "CLV", "Lifetime Value"]
        },
        'nombre_employe': {
            'fr': ["Nombre d'employés", "Effectifs", "Taille de l'équipe", "Employés", "ETP", "Personnel"],
            'en': ["Headcount", "Employee Count", "Employees", "Team Size", "FTE", "Staff"]
        },
        'argent_brule': {
            'fr': ["Argent brûlé", "Cash Burn", "Brûlage de trésorerie", "Flux de trésorerie net", "Burn Rate"],
            'en': ["Cash Burn", "Burn Rate", "Net Cash Flow", "Cash Consumption"]
        },
        'ebitda': {
            'fr': ["EBITDA", "BAIIA", "Excédent Brut d'Exploitation", "EBE", "Résultat opérationnel"],
            'en': ["EBITDA", "Earnings Before Interest, Taxes, Depreciation, and Amortization", "Operating Income"]
        },
        'revenu_annuel': {
            'fr': ["Revenu Annuel Récurrent", "ARR", "Revenu récurrent annuel", "RRA"],
            'en': ["Annual Recurring Revenue", "ARR", "Recurring Annual Revenue"]
        },
        'revenu_mensuel': {
            'fr': ["Revenu Mensuel Récurrent", "MRR", "Revenu récurrent mensuel", "RRM"],
            'en': ["Monthly Recurring Revenue", "MRR", "Recurring Monthly Revenue"]
        },
        'montant_leve': {
            'fr': ["Montant levé", "Levée de fonds", "Financement obtenu", "Capital levé", "Fonds levés"],
            'en': ["Funding Amount", "Funds Raised", "Capital Raised", "Investment Amount"]
        },
        'tresorerie': {
            'fr': ["Trésorerie", "Cash", "Liquidités", "Encaisse", "Cash balance"],
            'en': ["Cash", "Cash Balance", "Treasury", "Liquidity", "Cash on Hand"]
        },
        'croissance': {
            'fr': ["Croissance", "Taux de croissance", "Croissance YoY", "Growth", "Progression"],
            'en': ["Growth", "Growth Rate", "YoY Growth", "QoQ Growth", "Revenue Growth"]
        },
        'benefice_net': {
            'fr': ["Bénéfice net", "Résultat net", "Profit net", "BN"],
            'en': ["Net Profit", "Net Income", "Net Earnings", "Bottom Line"]
        },
        'churn': {
            'fr': ["Churn", "Taux d'attrition", "Taux de départ", "Perte de clients"],
            'en': ["Churn", "Churn Rate", "Customer Attrition", "Customer Loss Rate"]
        },
        'conversion': {
            'fr': ["Taux de conversion", "Conversion", "Taux de transformation"],
            'en': ["Conversion Rate", "Conversion", "Lead Conversion"]
        }
        # Ajouter d'autres KPI et leurs synonymes ici si nécessaire
    }
    
    lang = 'fr' if language == 'fr' else 'en'
    # Retourner la liste des noms possibles, ou le code KPI comme fallback
    return mappings.get(kpi_code, {}).get(lang, [kpi_code])

def analyze_images_with_gpt(
    image_paths: List[str], 
    requested_language: str = 'en',
    periodicity: str = 'Q',
    selected_kpis: List[str] = None,
    year: str = '2023'
) -> Dict[str, Any]:
    """
    Analyse une liste d'images (pages PDF) avec GPT Vision pour extraire les données financières.
    Args:
        image_paths: Liste des chemins vers les images des pages.
        requested_language: Langue souhaitée pour la sortie (ex: 'fr', 'en').
        periodicity: Périodicité des données ('Q' pour trimestriel, 'H' pour semestriel).
        selected_kpis: Liste des codes KPI à rechercher spécifiquement.
        year: Année des données financières.
    Returns:
        Dictionnaire contenant les données financières extraites.
    """
    logger.info(f"Analyse de {len(image_paths)} images avec GPT Vision (Langue: {requested_language}, périodicité: {periodicity}, année: {year})")

    # Limiter le nombre d'images par appel API si nécessaire
    MAX_IMAGES_PER_CALL = 50  # Augmenté de 20 à 50
    if len(image_paths) > MAX_IMAGES_PER_CALL:
        logger.warning(f"Le nombre d'images ({len(image_paths)}) dépasse la limite fixée ({MAX_IMAGES_PER_CALL}). Tronquage.")
        image_paths = image_paths[:MAX_IMAGES_PER_CALL]
    else:
        logger.info(f"Traitement de {len(image_paths)} images (dans la limite de {MAX_IMAGES_PER_CALL})")

    try:
        # Déterminer la langue de la réponse souhaitée
        output_language = "French" if requested_language == 'fr' else "English"
        
        # Générer les périodes attendues en fonction de la périodicité
        expected_periods = []
        period_description = ""
        if periodicity == 'Q':
            expected_periods = ["Q1", "Q2", "Q3", "Q4"]
            period_description = "quarterly periods (Q1, Q2, Q3, Q4)"
        elif periodicity == 'H':
            expected_periods = ["H1", "H2"]
            period_description = "half-yearly periods (H1, H2)"
        elif periodicity == 'Y':
            expected_periods = [f"{year}"]
            period_description = "annual period"
            
        # Préparer la liste des KPIs à rechercher avec leurs différentes désignations possibles
        kpi_targets = []
        if selected_kpis:
            for kpi_code in selected_kpis:
                kpi_names = get_kpi_mapping(kpi_code, requested_language)
                kpi_targets.extend(kpi_names)
        
        # Formuler la liste des KPIs demandés de manière plus flexible
        if kpi_targets:
            kpi_list_formatted = ", ".join([f'"{k}"' for k in kpi_targets])
            kpi_instruction = f"""
            PRIORITÉ: Recherchez spécifiquement ces KPIs: {kpi_list_formatted}
            MAIS AUSSI: Extrayez TOUS les autres KPIs financiers trouvés dans le document, même s'ils ne sont pas dans la liste prioritaire.
            """
        else:
            kpi_instruction = "Extrayez TOUS les KPIs financiers trouvés dans le document."
            kpi_list_formatted = "all financial KPIs in the document"
        
        kpi_primary_names = {}
        if selected_kpis:
            for kpi_code in selected_kpis:
                kpi_names_fr = get_kpi_mapping(kpi_code, 'fr')
                if kpi_names_fr:
                    kpi_primary_names[kpi_code] = kpi_names_fr[0] # Use first French name as primary

        system_prompt = f"""
        You are an expert financial data analyst specializing in extracting precise KPI data from financial reports and tables.
        Your task is to carefully examine financial tables in the provided images and extract ONLY the specific KPIs and periods requested.
        Recognize common financial synonyms and variations for the requested KPIs, and map them to the primary KPI name provided in the output.
        
        Example Synonyms Mapping:
        - If asked for 'Chiffre d\'affaires', also recognize 'Revenue', 'Sales', 'Turnover', 'Net Bookings', 'Ventes', 'Recettes' and report the data under 'Chiffre d\'affaires'.
        - If asked for 'Nombre d\'employés', also recognize 'Headcount', 'Effectifs', 'Team Size', 'Employees' and report the data under 'Nombre d\'employés'.
        
        Follow these core principles:
        1. Be extremely precise about column identification and alignment.
        2. Never substitute missing data with data from other columns.
        3. Rely on visual layout and alignment to determine which value belongs to which period.
        4. Produce JSON output containing only verified, visually confirmed data, mapped to the primary KPI names.
        5. Avoid all speculation or estimation.
        6. PRESERVE THE EXACT NUMERIC FORMAT as seen in the document, including units, symbols, and decimal separators.
        
        You should work in {output_language} for any text output.
        """

        # Complete prompt rewritten to be much more explicit and visual
        user_prompt = f"""
        # DATA EXTRACTION TASK
        
        Vous devez extraire TOUS les KPIs financiers trouvés dans les images, pour l'année {year}.
        
        {kpi_instruction}
        
        RÈGLE IMPORTANTE: N'ignorez AUCUN KPI financier visible dans le document. Extrayez TOUT, même si ce n'est pas explicitement demandé.
        
        ## TYPES DE KPIs À RECHERCHER (liste non exhaustive)
        
        Recherchez ces types de données financières et leurs synonymes :
        - Revenus/Chiffre d'affaires (Revenue, Sales, Net Bookings, Turnover)
        - EBITDA (Excédent Brut d'Exploitation, EBE, BAIIA)
        - Marges (Gross Margin, Operating Margin, Net Margin)
        - Effectifs (Headcount, Employees, FTE, Personnel)
        - Cash/Trésorerie (Cash, Cash Flow, Cash Burn, Funds)
        - Revenus récurrents (ARR, MRR, Recurring Revenue)
        - Coûts d'acquisition (CAC, Customer Acquisition Cost)
        - Valeur vie client (LTV, CLV, Customer Lifetime Value)
        - Levées de fonds (Funding, Capital Raised, Investment)
        - Croissance (Growth Rate, YoY Growth, QoQ Growth)
        - Ratios financiers (P/E, ROI, ROE, Debt Ratio)
        - ET TOUT AUTRE INDICATEUR FINANCIER visible
        
        ## TABLE STRUCTURE UNDERSTANDING
        
        Le document contient des tableaux avec des périodes {period_description} pour {year}. Vous DEVEZ:
        
        1. Identifier TOUTES les colonnes de périodes : {', '.join(expected_periods)}
        2. Extraire TOUS les KPIs de TOUTES les lignes, pas seulement ceux demandés
        3. Suivre visuellement l'alignement des colonnes avec précision
        4. NE JAMAIS ignorer une ligne qui contient des données financières
        
        ## EXTRACTION RULES
        
        - INCLUSIVITÉ MAXIMALE: Extrayez TOUT indicateur financier trouvé
        - POSITION PRÉCISE: Alignement visuel exact entre en-têtes et données
        - SYNONYMES: Reconnaissez toutes les variantes possibles des noms de KPIs
        - FORMAT PRÉSERVÉ: Gardez les unités, symboles et formatage exacts
        - AUCUNE OMISSION: Ne manquez aucune ligne de données financières
        - DÉTECTION INTELLIGENTE: Même si un KPI n'est pas dans votre liste, extrayez-le s'il est financier
        
        ## RESPONSE FORMAT
        
        Retournez un objet JSON avec TOUS les KPIs trouvés :
        ```json
        {{
          "periods": {json.dumps(expected_periods)},
          "kpi": {{
            "Nom du KPI 1": {{  // Utilisez le nom exact trouvé dans le document
              "{expected_periods[0] if expected_periods else 'Period'}": "valeur avec unité", 
              // Ajoutez toutes les autres périodes trouvées
            }},
            "Nom du KPI 2": {{ 
               // ... données pour toutes les périodes ...
            }}
            // INCLUEZ TOUS LES KPIs trouvés, même non demandés spécifiquement
          }}
        }}
        ```
        
        RAPPEL CRUCIAL: Extrayez TOUS les KPIs financiers visibles, pas seulement ceux de la liste prioritaire. Votre objectif est la complétude, pas la sélection.
        """

        # Construction du message pour l'API Vision
        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt}
                    # Images will be added below
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

        # Appel à l'API OpenAI avec température réduite pour plus de précision
        response = client.chat.completions.create(
            model="gpt-4.1", 
            messages=messages,
            response_format={"type": "json_object"},
            max_tokens=4000,
            temperature=0.0  # Réduire la température pour des résultats plus déterministes
        )

        result_text = response.choices[0].message.content
        logger.info(f"Réponse brute de GPT Vision: {result_text}")
        
        # Sauvegarder la réponse brute pour debugging
        try:
            import os
            debug_file = "gpt_vision_debug_response.json"
            with open(debug_file, "w", encoding="utf-8") as f:
                f.write(result_text)
            logger.info(f"Réponse GPT Vision sauvegardée dans: {debug_file}")
        except Exception as e:
            logger.warning(f"Impossible de sauvegarder la réponse de debug: {e}")
        
        try:
            result = json.loads(result_text)
            
            # Logging détaillé des KPIs extraits
            if "kpi" in result and isinstance(result["kpi"], dict):
                logger.info(f"Nombre de KPIs extraits par GPT Vision: {len(result['kpi'])}")
                for kpi_name, kpi_data in result["kpi"].items():
                    logger.info(f"  - KPI: {kpi_name} | Périodes: {list(kpi_data.keys()) if isinstance(kpi_data, dict) else 'Format invalide'}")
            else:
                logger.warning("Aucun KPI trouvé dans la réponse GPT Vision ou format invalide")
            
            # Extraire uniquement le texte par OCR pour le retourner séparément
            extracted_text = extract_text_from_images(image_paths)
            result["extracted_text"] = extracted_text
            
            # S'assurer que "periods" est présent dans le résultat, sinon ajouter les périodes attendues
            if "periods" not in result:
                result["periods"] = expected_periods

                # Vérifier que le format des données KPI est correct
                if "kpi" not in result or not isinstance(result["kpi"], dict):
                    result["kpi"] = {}
                    result["error"] = "Aucune donnée KPI n'a pu être extraite des images"

            return result
            
        except json.JSONDecodeError:
            logger.error(f"Erreur de décodage JSON de la réponse GPT Vision: {result_text}")
            # Tenter une extraction de secours si le format est incorrect
            return {
                "error": "Le format de réponse de GPT Vision est invalide",
                "periods": expected_periods,
                "kpi": {},
                "raw_response": result_text,
                "extracted_text": extract_text_from_images(image_paths)
            }

    except openai.APIError as e:
        logger.error(f"Erreur API OpenAI: {e}")
        return {"error": f"OpenAI API Error: {e}", "periods": expected_periods, "kpi": {}}
    except Exception as e:
        logger.error(f"Erreur inattendue lors de l'analyse des images avec GPT: {e}")
        return {"error": f"Unexpected error during image analysis: {e}", "periods": expected_periods, "kpi": {}}

def extract_numeric_value(value_str: str) -> Dict[str, Any]:
    """
    Extrait la valeur numérique d'une chaîne et conserve l'unité.
    Retourne un dictionnaire avec la valeur numérique et les métadonnées.
    
    Args:
        value_str: Chaîne contenant une valeur (ex: "125K€", "-3.2M$", "12%")
        
    Returns:
        Dictionnaire avec les clés:
        - value: Valeur numérique (float ou int)
        - display: Valeur formatée pour affichage
        - unit: Unité extraite
        - is_numeric: True si la conversion a réussi
    """
    if not value_str or value_str == 'N.A':
        return {
            "value": None,
            "display": "N.A",
            "unit": "",
            "is_numeric": False
        }
    
    original_value = value_str
    value_str = str(value_str).strip()
    
    # Traiter les valeurs négatives avec parenthèses (ex: "(123)" -> "-123")
    is_negative = False
    if value_str.startswith('(') and value_str.endswith(')'):
        value_str = value_str[1:-1]
        is_negative = True
    
    # Remplacer certaines expressions pour faciliter l'extraction
    value_str = value_str.replace('−', '-')  # Remplacer le signe moins unicode par un tiret
    
    # Gérer explicitement les signes négatifs
    if value_str.startswith('-'):
        is_negative = True
        value_str = value_str[1:]
    
    # Extraire le nombre et l'unité avec des expressions régulières
    import re
    
    # Expressions régulières pour différents formats
    # Formats courants en finance: 12,3 M€, 45K$, 1,234.56€, -78%, (90), etc.
    patterns = [
        # Pourcentages: 12% ou 12.3%
        r'^([\d\s]+[.,]?\d*)\s*(%)',
        
        # Devises avec suffixe: 12K€, 5.3M$, etc.
        r'^([\d\s]+[.,]?\d*)\s*([KkMBG])?\s*([€$£¥])',
        
        # Devises avec préfixe: €12K, $5.3M, etc.
        r'^([€$£¥])\s*([\d\s]+[.,]?\d*)\s*([KkMBG])?',
        
        # Multiplicateurs sans devise: 12K, 5.3M, etc.
        r'^([\d\s]+[.,]?\d*)\s*([KkMBG])',
        
        # Nombres simples avec unités potentielles: 123, 456, 789, etc.
        r'^([\d\s]+[.,]?\d*)(.*)'
    ]
    
    # Tester chaque pattern
    match = None
    matched_pattern = None
    
    for i, pattern in enumerate(patterns):
        match = re.match(pattern, value_str, re.IGNORECASE)
        if match:
            matched_pattern = i
            break
    
    if not match:
        return {
            "value": None,
            "display": original_value,
            "unit": "",
            "is_numeric": False
        }
    
    # Extraire la valeur numérique en fonction du pattern utilisé
    num_str = None
    unit = ""
    
    if matched_pattern == 0:  # Pourcentages
        num_str = match.group(1)
        unit = match.group(2)
    elif matched_pattern == 1:  # Devises avec suffixe
        num_str = match.group(1)
        multiplier = match.group(2) if match.group(2) else ""
        currency = match.group(3) if match.group(3) else ""
        unit = multiplier + currency
    elif matched_pattern == 2:  # Devises avec préfixe
        currency = match.group(1)
        num_str = match.group(2)
        multiplier = match.group(3) if match.group(3) else ""
        unit = currency + multiplier
    elif matched_pattern == 3:  # Multiplicateurs sans devise
        num_str = match.group(1)
        unit = match.group(2)
    else:  # Nombres simples avec unités potentielles
        num_str = match.group(1)
        unit = match.group(2).strip() if match.group(2) else ""
    
    # Nettoyer la chaîne numérique
    if num_str:
        # Supprimer les espaces et remplacer la virgule par un point
        num_str = num_str.replace(' ', '').replace(',', '.')
    
    try:
        # Convertir en nombre
        num_value = float(num_str)
        
        # Appliquer le signe négatif si nécessaire
        if is_negative:
            num_value = -num_value
        
        # Traitement spécial pour les pourcentages
        if '%' in unit:
            # Laisser tel quel (pourcentage)
            pass
        else:
            # Appliquer les multiplicateurs basés sur l'unité
            if 'K' in unit or 'k' in unit:
                num_value *= 1000
            elif 'M' in unit or 'm' in unit:
                num_value *= 1000000
            elif 'B' in unit or 'G' in unit or 'b' in unit or 'g' in unit:
                num_value *= 1000000000
        
        # Convertir en entier si c'est un nombre sans décimales
        if num_value == int(num_value):
            num_value = int(num_value)
        
        return {
            "value": num_value,
            "display": original_value,
            "unit": unit,
            "is_numeric": True
        }
    except (ValueError, TypeError) as e:
        logger.warning(f"Impossible de convertir '{num_str}' en nombre: {e}")
        return {
            "value": None,
            "display": original_value,
            "unit": "",
            "is_numeric": False
        }

def clean_kpi_data(
    extracted_data: Dict[str, Any], 
    selected_kpis: List[str] = None, 
    periodicity: str = 'Q', 
    requested_language: str = 'fr',
    year: str = '2023'
) -> Dict[str, Any]:
    """
    Nettoie et vérifie les données KPI extraites pour s'assurer qu'elles correspondent au format attendu.
    Filtre également pour ne garder que les KPI sélectionnés.
    Convertit les valeurs numériques en nombres tout en conservant les unités.
    
    Args:
        extracted_data: Données extraites par OpenAI
        selected_kpis: Liste des codes KPI demandés
        periodicity: Périodicité des données ('Q' pour trimestriel, 'H' pour semestriel)
        requested_language: Langue demandée (fr ou en)
        year: Année des données financières
    
    Returns:
        Données KPI nettoyées avec uniquement les KPI sélectionnés et les valeurs numériques convertis
    """
    try:
        # Vérifier que les données ont la structure attendue
        if not isinstance(extracted_data, dict):
            logger.error("Les données extraites ne sont pas un dictionnaire")
            return {"error": "Format de données invalide", "kpi": {}, "periods": []}
            
        if "kpi" not in extracted_data or not isinstance(extracted_data["kpi"], dict):
            logger.error("Les données KPI manquent ou ne sont pas au bon format")
            return {"error": "Aucune donnée KPI trouvée", "kpi": {}, "periods": []}
            
        if "periods" not in extracted_data or not isinstance(extracted_data["periods"], list):
            logger.warning("Périodes manquantes ou au format incorrect")
            # Créer les périodes en fonction de la périodicité
            if periodicity == 'Q':
                periods = ["Q1", "Q2", "Q3", "Q4"]
            elif periodicity == 'H':
                periods = ["H1", "H2"]
            elif periodicity == 'Y':
                periods = [f"{year}"]
            else:
                periods = []
        else:
            periods = extracted_data["periods"]
            
        # Extraire et nettoyer les données KPI
        clean_kpi = {}
        numeric_kpi = {}  # Dictionnaire séparé pour les valeurs numériques
        kpi_data = extracted_data.get("kpi", {})
        
        # Normaliser les clés de période si nécessaire
        # Certains modèles peuvent renvoyer "Q1 2023" au lieu de "Q1"
        def normalize_period_key(key):
            # Pour les clés comme "Q1 2023", extraire juste "Q1"
            if periodicity == 'Q':
                for q in ["Q1", "Q2", "Q3", "Q4"]:
                    if key.startswith(q):
                        return q
            elif periodicity == 'H':
                for h in ["H1", "H2"]:
                    if key.startswith(h):
                        return h
            elif periodicity == 'Y':
                for y in [f"{year}"]:
                    if key.startswith(y):
                        return y
            return key
            
        # Créer un dictionnaire de correspondance KPI anglais/français pour une recherche plus efficace
        kpi_name_mapping = {}
        if selected_kpis:
            for kpi_code in selected_kpis:
                fr_names = get_kpi_mapping(kpi_code, 'fr')
                en_names = get_kpi_mapping(kpi_code, 'en')
                
                # Utiliser le premier nom français comme nom principal
                primary_fr_name = fr_names[0] if fr_names else kpi_code
                
                # Mapper tous les noms possibles (anglais et français) vers le nom principal français
                for name in fr_names + en_names:
                    kpi_name_mapping[name.lower()] = {
                        'fr_name': primary_fr_name,
                        'code': kpi_code
                    }
                    
                # Ajouter certaines variantes courantes pour des correspondances plus robustes
                if kpi_code == 'ebitda':
                    kpi_name_mapping['ebitda'.lower()] = {'fr_name': 'EBITDA', 'code': kpi_code}
                elif kpi_code == 'nombre_employe':
                    kpi_name_mapping['headcount'.lower()] = {'fr_name': "Nombre d'employés", 'code': kpi_code}
                elif kpi_code == 'chiffre_affaire':
                    kpi_name_mapping['revenue'.lower()] = {'fr_name': "Chiffre d'affaires", 'code': kpi_code}
                    kpi_name_mapping['net bookings'.lower()] = {'fr_name': "Chiffre d'affaires", 'code': kpi_code}
            
            logger.info(f"Mapping des noms de KPI créé: {kpi_name_mapping}")
            
        # Si aucun KPI n'est sélectionné, on accepte tous les KPI extraits
        accept_all_kpis = not selected_kpis or len(selected_kpis) == 0
        
        logger.info(f"Mode d'acceptation des KPIs: {'Tous les KPIs' if accept_all_kpis else 'KPIs sélectionnés uniquement'}")
        logger.info(f"KPIs sélectionnés: {selected_kpis}")
        logger.info(f"KPIs extraits bruts: {list(kpi_data.keys())}")
        
        # Parcourir les données KPI extraites
        for kpi_name, periods_data in kpi_data.items():
            kpi_name_lower = kpi_name.lower()
            
            # Ignorer les entrées sans nom de KPI ou sans périodes
            if not kpi_name or not periods_data:
                logger.warning(f"KPI ignoré - nom vide ou pas de données: {kpi_name}")
                continue
                
            # Vérifier si ce KPI fait partie des KPI sélectionnés
            selected = False
            fr_kpi_name = kpi_name  # Par défaut, on utilise le nom tel quel
            
            if accept_all_kpis:
                # Si tous les KPI sont acceptés
                selected = True
                logger.info(f"KPI accepté (mode tous KPIs): {kpi_name}")
                # Essayer de traduire le nom en français si possible
                for kpi_code in ['chiffre_affaire', 'marge_brute', 'cout_acquisition', 'valeur_vie_client',
                              'nombre_employe', 'argent_brule', 'ebitda', 'revenu_annuel', 'revenu_mensuel', 'montant_leve']:
                    fr_names = get_kpi_mapping(kpi_code, 'fr')
                    en_names = get_kpi_mapping(kpi_code, 'en')
                    
                    # Vérifier si le nom du KPI correspond à une des variantes anglaises
                    for en_name in en_names:
                        if en_name.lower() in kpi_name_lower or kpi_name_lower in en_name.lower():
                            fr_kpi_name = fr_names[0] if fr_names else kpi_name
                            logger.info(f"KPI traduit: {kpi_name} -> {fr_kpi_name}")
                            break
            else:
                # Vérifier si ce KPI est dans la liste des KPI sélectionnés
                for kpi_code in selected_kpis:
                    fr_names = get_kpi_mapping(kpi_code, 'fr')
                    en_names = get_kpi_mapping(kpi_code, 'en')
                    
                    # Vérifier si le nom du KPI correspond à une des variantes (en anglais ou français)
                    for name_list in [fr_names, en_names]:
                        for name in name_list:
                            # Rendre la correspondance plus flexible
                            if (name.lower() in kpi_name_lower or 
                                kpi_name_lower in name.lower() or
                                any(word in kpi_name_lower.split() for word in name.lower().split())):
                                selected = True
                                fr_kpi_name = fr_names[0] if fr_names else kpi_name
                                logger.info(f"KPI sélectionné correspondant: {kpi_name} -> {fr_kpi_name} (code: {kpi_code})")
                                break
                        if selected:
                            break
            
            # Si ce KPI n'est pas sélectionné, l'ignorer
            if not selected:
                logger.info(f"KPI ignoré (non sélectionné): {kpi_name}")
                continue
                
            # Créer une entrée propre pour ce KPI avec normalisation des clés de période
            clean_values = {}
            numeric_values = {}  # Pour stocker les valeurs numériques séparément
            
            for orig_period, value in periods_data.items():
                period = normalize_period_key(orig_period)
                
                # Vérifier que la période est valide et a une valeur
                if period in periods and value:
                    # Normaliser la valeur (enlever les espaces superflus, etc.)
                    clean_value = str(value).strip()
                    clean_values[period] = clean_value
                    
                    # Extraire la valeur numérique mais la stocker séparément
                    numeric_result = extract_numeric_value(clean_value)
                    numeric_values[period] = numeric_result
                    
                    # Logging détaillé des valeurs extraites
                    logger.info(f"KPI {fr_kpi_name}, période {period}: valeur={clean_value}, valeur numérique={numeric_result}")
            
            # N'ajouter le KPI que s'il a des valeurs
            if clean_values:
                clean_kpi[fr_kpi_name] = clean_values
                numeric_kpi[fr_kpi_name] = numeric_values
        
        logger.info(f"Données KPI nettoyées: {len(clean_kpi)} KPIs trouvés")
        
        # Logging détaillé des KPIs numériques
        for kpi_name, periods_data in numeric_kpi.items():
            logger.info(f"KPI numérique: {kpi_name}")
            for period, value_data in periods_data.items():
                logger.info(f"  - {period}: {value_data.get('value')}, unité: {value_data.get('unit')}")
        
        # Conserver d'autres données potentiellement utiles du résultat original
        result = {
            "kpi": clean_kpi,
            "periods": periods,
            "numeric_kpi": numeric_kpi  # Ajouter les valeurs numériques dans un champ séparé
        }
        
        # Récupérer le texte extrait s'il existe
        if "extracted_text" in extracted_data:
            result["extracted_text"] = extracted_data["extracted_text"]
        elif "text" in extracted_data:
            result["extracted_text"] = extracted_data["text"]
        
        # Ajouter un warning si aucun KPI n'a été trouvé alors que des KPI étaient demandés
        if not clean_kpi and selected_kpis:
            result["warning"] = f"Aucun des KPI demandés n'a été trouvé dans le document"
            
        return result
    except Exception as e:
        logger.error(f"Erreur lors du nettoyage des données KPI: {e}", exc_info=True)
        return {"error": f"Erreur lors du traitement des données: {str(e)}", "kpi": {}, "periods": []}

def process_pdf(
    pdf_path: str, 
    output_folder: str, 
    requested_language: str = 'en',
    periodicity: str = 'Q',
    selected_kpis: List[str] = None,
    year: str = '2023'
) -> Dict[str, Any]:
    """
    Traite un fichier PDF en convertissant en images et en analysant les images avec GPT Vision.
    Args:
        pdf_path: Chemin vers le fichier PDF.
        output_folder: Dossier de sortie.
        requested_language: Langue demandée pour l'analyse.
        periodicity: Périodicité des données ('Q' pour trimestriel, 'H' pour semestriel).
        selected_kpis: Liste des codes KPI à rechercher spécifiquement.
        year: Année des données financières.
    Returns:
        Dictionnaire contenant les données financières extraites et les URLs des images.
    """
    logger.info(f"Traitement du PDF {pdf_path} (Langue: {requested_language}, périodicité: {periodicity}, année: {year}, KPIs: {selected_kpis})")

    image_paths_internal = []
    processing_id = os.path.splitext(os.path.basename(pdf_path))[0]
    
    # Générer les périodes attendues
    expected_periods = []
    if periodicity == 'Q':
        expected_periods = ["Q1", "Q2", "Q3", "Q4"]
    elif periodicity == 'H':
        expected_periods = ["H1", "H2"]
    elif periodicity == 'Y':
        expected_periods = [f"{year}"]
    
    result_data = {
        "error": "Initialization error", 
        "image_urls": [],
        "periods": expected_periods
    }

    try:
        # Étape 1: Convertir le PDF en images
        image_paths_internal = convert_pdf_to_images(pdf_path, output_folder)
        logger.info(f"Images générées: {len(image_paths_internal)}")
        
        if not image_paths_internal:
            return {
                "error": "Impossible de convertir le PDF en images", 
                "image_urls": [], 
                "periods": expected_periods
            }

        # Étape 2: Analyser les images avec GPT Vision
        logger.info("Démarrage de l'analyse des images avec GPT Vision")
        extracted_data = analyze_images_with_gpt(
            image_paths_internal, 
            requested_language,
            periodicity,
            selected_kpis,
            year
        )

        if not extracted_data or not isinstance(extracted_data, dict):
            logger.error("Résultat d'analyse invalide")
            return {
                "error": "L'analyse n'a pas retourné de données valides", 
                "image_urls": [], 
                "periods": expected_periods
            }
        
        # Vérifier si l'analyse a retourné une erreur
        if "error" in extracted_data and extracted_data["error"]:
            logger.error(f"Erreur détectée lors de l'analyse: {extracted_data['error']}")
            
        # Étape 3: Nettoyer et vérifier les données extraites
        cleaned_data = clean_kpi_data(extracted_data, selected_kpis, periodicity, requested_language, year)
        
        # Si une erreur a été détectée lors du nettoyage, la propager
        if "error" in cleaned_data and "error" not in extracted_data:
            extracted_data["error"] = cleaned_data["error"]
        
        # Ajouter les données nettoyées
        extracted_data["kpi"] = cleaned_data.get("kpi", {})
        
        # S'assurer que les valeurs numériques sont incluses
        extracted_data["numeric_kpi"] = cleaned_data.get("numeric_kpi", {})
        
        # Conserver l'avertissement s'il existe
        if "warning" in cleaned_data:
            extracted_data["warning"] = cleaned_data["warning"]

        # Étape 4: Préparer les chemins web-accessibles
        image_filenames = [os.path.basename(p) for p in image_paths_internal]
        # Utiliser des URLs absolues qui fonctionneront dans le frontend
        host_url = "http://localhost:5000"
        image_urls_web = [f"{host_url}/processed/{fname}" for fname in image_filenames]
        
        # Vérifier que les images existent bien
        valid_images = []
        for i, (img_path, img_url) in enumerate(zip(image_paths_internal, image_urls_web)):
            if os.path.exists(img_path):
                logger.info(f"Image {i+1}/{len(image_paths_internal)} disponible: {img_path} -> {img_url}")
                valid_images.append(img_url)
            else:
                logger.warning(f"Image {i+1}/{len(image_paths_internal)} manquante: {img_path}")
        
        # Vérification finale des KPI extraits
        kpi_count = len(extracted_data.get("kpi", {}))
        logger.info(f"Nombre de KPI extraits: {kpi_count}")
        
        if kpi_count == 0 and selected_kpis:
            logger.warning("Aucun KPI extrait malgré la sélection de KPI spécifiques")
            extracted_data["warning"] = "Aucun KPI n'a pu être extrait du document. Vérifiez que le document contient bien des données financières."
        
        # Étape 5: Sauvegarder les résultats
        result_file_path = os.path.join(output_folder, f"{processing_id}_vision_results.json")
        try:
            full_result_to_save = {
                "extracted_data": extracted_data,
                "image_urls_web": image_urls_web,
                "periodicity": periodicity,
                "selected_kpis": selected_kpis,
                "year": year
            }
            with open(result_file_path, "w", encoding="utf-8") as f:
                json.dump(full_result_to_save, f, ensure_ascii=False, indent=2)
            logger.info(f"Résultats sauvegardés: {result_file_path}")
        except Exception as e:
            logger.error(f"Impossible de sauvegarder les résultats JSON: {e}")

        # Préparer la réponse finale
        result_data = {
            "extracted_data": extracted_data,
            "image_urls": valid_images,
            "processing_id": processing_id,
            "extracted_text": extracted_data.get("extracted_text", ""),
            "periods": extracted_data.get("periods", expected_periods)
        }
        
        # Ajouter un warning s'il y en avait un dans extracted_data
        if isinstance(extracted_data, dict) and "error" in extracted_data:
            result_data["processing_warning"] = extracted_data["error"]
            
        # Ajouter l'URL du PDF pour pouvoir l'afficher
        pdf_filename = os.path.basename(pdf_path)
        result_data["pdf_url"] = f"{host_url}/uploads/{pdf_filename}"
        logger.info(f"URL du PDF dans la réponse: {result_data['pdf_url']}")
        
        # Log des résultats pour débogage
        logger.info(f"Périodes extraites: {result_data['periods']}")
        logger.info(f"KPIs extraits: {list(extracted_data.get('kpi', {}).keys())}")
        
        # Vérification finale des données
        if not result_data.get("extracted_data", {}).get("kpi", {}):
            if "processing_warning" in result_data:
                result_data["processing_warning"] += " Aucune donnée KPI n'a pu être extraite."
            else:
                result_data["processing_warning"] = "Aucune donnée KPI n'a pu être extraite."

        return result_data

    except Exception as e:
         logger.error(f"Erreur globale lors du traitement du PDF {pdf_path}: {e}", exc_info=True)
         result_data = {
             "error": f"Failed to process PDF via image analysis: {e}", 
             "image_urls": [], 
             "processing_id": processing_id,
             "periods": expected_periods
         }

    return result_data

def safe_delete(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        logger.warning(f"Impossible de supprimer le fichier {path}: {e}") 