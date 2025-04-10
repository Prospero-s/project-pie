import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import pdf_processor

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Activer CORS pour toutes les routes
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['UPLOAD_FOLDER'] = '/app/uploads'
app.config['PROCESSED_FOLDER'] = '/app/processed'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max

# S'assurer que les dossiers existent
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    language = request.form.get('language', 'en') # Récupérer la langue, défaut 'en'
    logger.info(f"Langue demandée par le frontend: {language}")

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = secure_filename(file.filename)
        base_filename = os.path.splitext(filename)[0]
        processing_id = f"{base_filename}_{timestamp}"
        
        # Chemin du fichier PDF sauvegardé
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{processing_id}.pdf")
        file.save(pdf_path)
        
        logger.info(f"PDF reçu et sauvegardé: {pdf_path}")
        
        try:
            # Traitement du PDF, passer la langue
            processing_result = pdf_processor.process_pdf(
                pdf_path=pdf_path,
                output_folder=app.config['PROCESSED_FOLDER'],
                requested_language=language # Passer la langue
            )

            # Vérifier s'il y a une erreur dans le résultat
            if "error" in processing_result and not processing_result.get("extracted_data"):
                # Si une erreur majeure s'est produite (pas de données extraites)
                logger.error(f"Erreur renvoyée par process_pdf: {processing_result['error']}")
                return jsonify({"error": processing_result['error']}), 500
            else:
                # Si le traitement a réussi (ou a produit des données partielles malgré une erreur mineure)
                response_data = {
                    "message": "File processed successfully",
                    "processing_id": processing_id,
                    "data": processing_result.get("extracted_data"),
                    "image_urls": processing_result.get("image_urls", [])
                }
                # S'il y avait une erreur mais qu'on a quand même des données, l'ajouter à la réponse
                if "error" in processing_result:
                    response_data["processing_warning"] = processing_result["error"]
                    logger.warning(f"Avertissement pendant le traitement: {processing_result['error']}")
                    
                return jsonify(response_data), 200

        except Exception as e:
            logger.error(f"Exception majeure lors du traitement du PDF: {str(e)}", exc_info=True)
            return jsonify({"error": f"An unexpected server error occurred: {str(e)}"}), 500
    else:
        return jsonify({"error": "Only PDF files are allowed"}), 400

def safe_delete(file_path):
    """Supprime un fichier en toute sécurité, en ignorant les erreurs si le fichier n'existe pas."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Fichier supprimé : {file_path}")
    except OSError as e:
        logger.warning(f"Impossible de supprimer le fichier {file_path}: {e}")

@app.route('/cleanup/<processing_id>', methods=['POST'])
def cleanup_files(processing_id):
    """Nettoie les fichiers associés à un ID de traitement."""
    if not processing_id or '..' in processing_id or '/' in processing_id:
        return jsonify({"error": "Invalid processing ID"}), 400

    logger.info(f"Demande de nettoyage pour l'ID: {processing_id}")

    # Chemin du PDF original
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{processing_id}.pdf")
    safe_delete(pdf_path)

    # Chemins des images potentielles (supposer un max de pages pour la recherche)
    # Une approche plus robuste serait de lister les fichiers commençant par l'ID
    # ou de stocker la liste des images générées quelque part (ex: dans le JSON de résultats)
    # Pour simplifier ici, on suppose un nombre max de pages (ex: 100)
    for i in range(1, 101):
        img_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{processing_id}_page_{i}.jpg")
        safe_delete(img_path)

    # Nettoyer aussi le fichier JSON de résultat
    result_json_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{processing_id}_vision_results.json")
    safe_delete(result_json_path)

    return jsonify({"message": f"Cleanup attempted for ID: {processing_id}"}), 200

@app.route('/cleanup/all', methods=['POST'])
def cleanup_all_files():
    """Vide complètement les dossiers uploads et processed."""
    logger.info("Demande de nettoyage complet des dossiers uploads et processed")
    
    folders_to_clean = [app.config['UPLOAD_FOLDER'], app.config['PROCESSED_FOLDER']]
    files_deleted_count = 0
    errors_count = 0

    for folder in folders_to_clean:
        if not os.path.isdir(folder):
            logger.warning(f"Le dossier à nettoyer n'existe pas ou n'est pas un dossier: {folder}")
            continue
            
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                    files_deleted_count += 1
                elif os.path.isdir(file_path):
                    # Optionnel: supprimer les sous-dossiers ? Pour l'instant, on ignore.
                    pass 
            except Exception as e:
                logger.error(f'Échec de la suppression de {file_path}. Raison: {e}')
                errors_count += 1
                
    logger.info(f"Nettoyage complet terminé. Fichiers supprimés: {files_deleted_count}, Erreurs: {errors_count}")
    return jsonify({"message": f"Cleanup all attempted. Deleted: {files_deleted_count}, Errors: {errors_count}"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 