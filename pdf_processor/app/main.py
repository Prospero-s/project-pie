import os
import json
import logging
import signal
import threading
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
import pdf_processor

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TimeoutException(Exception):
    """Exception levée quand une opération dépasse le timeout"""
    pass

def timeout_handler(signum, frame):
    """Gestionnaire de signal pour les timeouts"""
    raise TimeoutException("Operation timed out")

def run_with_timeout(func, timeout_seconds, *args, **kwargs):
    """
    Execute une fonction avec un timeout
    """
    result = [None]
    exception = [None]
    
    def target():
        try:
            result[0] = func(*args, **kwargs)
        except Exception as e:
            exception[0] = e
    
    thread = threading.Thread(target=target)
    thread.daemon = True
    thread.start()
    thread.join(timeout_seconds)
    
    if thread.is_alive():
        # Le thread est encore actif, donc timeout
        logger.error(f"Timeout après {timeout_seconds} secondes")
        raise TimeoutException(f"Operation timed out after {timeout_seconds} seconds")
    
    if exception[0]:
        raise exception[0]
    
    return result[0]

app = Flask(__name__)

# Configuration CORS en fonction de l'environnement
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
if ALLOWED_ORIGINS == ['*']:
    # Développement - autoriser toutes les origines
    logger.info("Mode développement - CORS autorisé pour toutes les origines")
    CORS(app, resources={r"/*": {"origins": "*"}})
else:
    # Production - origines spécifiques
    logger.info(f"Mode production - CORS autorisé pour: {ALLOWED_ORIGINS}")
    CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

# Configuration sécurisée
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['TESTING'] = False

# Configuration des timeouts pour les requêtes longues
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000  # 1 an pour les fichiers statiques
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 heure pour les sessions

# Configuration pour gérer les gros uploads et les traitements longs
app.config['REQUEST_TIMEOUT'] = 600  # 10 minutes
app.config['PROCESSING_TIMEOUT'] = 600  # 10 minutes pour le traitement

# Utiliser des chemins absolus garantis pour les dossiers
project_root = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".."))
storage_dir = os.path.join(project_root, 'storage')
upload_folder = os.path.join(storage_dir, 'uploads')
processed_folder = os.path.join(storage_dir, 'processed')

# Afficher le chemin absolu complet pour le débogage
logger.info(f"Chemin absolu du projet: {project_root}")
logger.info(f"Chemin absolu du dossier storage: {storage_dir}")

# Configuration des dossiers
app.config['UPLOAD_FOLDER'] = upload_folder
app.config['PROCESSED_FOLDER'] = processed_folder
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max

# S'assurer que les dossiers existent avec les bonnes permissions
try:
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)
    
    # Essayer de définir les permissions 777 si on est propriétaire
    try:
        os.chmod(app.config['UPLOAD_FOLDER'], 0o777)
        os.chmod(app.config['PROCESSED_FOLDER'], 0o777)
        logger.info("Permissions 777 appliquées aux dossiers")
    except Exception as e:
        logger.warning(f"Impossible de modifier les permissions des dossiers: {e}")
except Exception as e:
    logger.error(f"Erreur lors de la création des dossiers: {e}")

# Vérifier que les dossiers sont réellement accessibles
logger.info(f"Dossier de téléchargement: {app.config['UPLOAD_FOLDER']} (existe: {os.path.exists(app.config['UPLOAD_FOLDER'])}, écriture: {os.access(app.config['UPLOAD_FOLDER'], os.W_OK)})")
logger.info(f"Dossier de traitement: {app.config['PROCESSED_FOLDER']} (existe: {os.path.exists(app.config['PROCESSED_FOLDER'])}, écriture: {os.access(app.config['PROCESSED_FOLDER'], os.W_OK)})")

# Route pour servir les fichiers PDF téléchargés
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    logger.info(f"Demande de fichier: {filename} dans {app.config['UPLOAD_FOLDER']}")
    full_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    # Pour le débogage, afficher si le fichier existe
    file_exists = os.path.exists(full_path)
    logger.info(f"Fichier demandé: {full_path}, existe: {file_exists}")
    
    if file_exists:
        logger.info(f"Fichier trouvé: {full_path}, taille: {os.path.getsize(full_path)} octets")
        response = send_file(full_path)
        # Configurer les en-têtes pour permettre l'affichage dans des iframes
        response.headers['Content-Type'] = 'application/pdf' if filename.endswith('.pdf') else 'image/jpeg'
        # Supprimer l'en-tête X-Frame-Options pour permettre l'inclusion dans des iframes
        # response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['Content-Disposition'] = f'inline; filename="{filename}"'
        response.headers['Access-Control-Allow-Origin'] = '*'  # Permettre les requêtes CORS
        return response
    else:
        logger.error(f"Fichier non trouvé: {full_path}")
        return jsonify({"error": f"File not found: {filename}"}), 404

# Route pour servir les images générées
@app.route('/processed/<path:filename>')
def serve_processed(filename):
    logger.info(f"Demande d'image: {filename} dans {app.config['PROCESSED_FOLDER']}")
    full_path = os.path.join(app.config['PROCESSED_FOLDER'], filename)
    
    # Pour le débogage, afficher si le fichier existe
    file_exists = os.path.exists(full_path)
    logger.info(f"Image demandée: {full_path}, existe: {file_exists}")
    
    if file_exists:
        logger.info(f"Image trouvée: {full_path}, taille: {os.path.getsize(full_path)} octets")
        response = send_file(full_path)
        response.headers['Content-Type'] = 'image/jpeg'
        response.headers['Access-Control-Allow-Origin'] = '*'  # Permettre les requêtes CORS
        # S'assurer qu'il n'y a pas de restriction X-Frame-Options
        if 'X-Frame-Options' in response.headers:
            del response.headers['X-Frame-Options']
        return response
    else:
        logger.error(f"Image non trouvée: {full_path}")
        return jsonify({"error": f"Image not found: {filename}"}), 404

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de santé pour vérifier que le service fonctionne."""
    try:
        # Vérifier que les dossiers essentiels existent
        upload_ok = os.path.exists(app.config['UPLOAD_FOLDER']) and os.access(app.config['UPLOAD_FOLDER'], os.W_OK)
        processed_ok = os.path.exists(app.config['PROCESSED_FOLDER']) and os.access(app.config['PROCESSED_FOLDER'], os.W_OK)
        
        # Vérifier la clé OpenAI
        openai_key_ok = bool(os.environ.get('OPENAI_API_KEY'))
        
        status = {
            "status": "healthy" if all([upload_ok, processed_ok, openai_key_ok]) else "degraded",
            "timestamp": datetime.now().isoformat(),
            "checks": {
                "upload_folder": "ok" if upload_ok else "error",
                "processed_folder": "ok" if processed_ok else "error", 
                "openai_key": "ok" if openai_key_ok else "missing",
            },
            "folders": {
                "upload": app.config['UPLOAD_FOLDER'],
                "processed": app.config['PROCESSED_FOLDER']
            }
        }
        
        return jsonify(status), 200 if status["status"] == "healthy" else 503
        
    except Exception as e:
        return jsonify({
            "status": "error", 
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/status', methods=['GET'])
def status_check():
    """Endpoint de statut détaillé pour le debugging."""
    try:
        import platform
        
        status = {
            "service": "PDF Processor",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "system": {
                "platform": platform.platform(),
                "python_version": platform.python_version(),
                "architecture": platform.architecture()[0]
            },
            "environment": {
                "flask_env": os.environ.get('FLASK_ENV', 'not_set'),
                "flask_debug": os.environ.get('FLASK_DEBUG', 'not_set'),
                "openai_key_configured": bool(os.environ.get('OPENAI_API_KEY'))
            },
            "folders": {
                "upload": {
                    "path": app.config['UPLOAD_FOLDER'],
                    "exists": os.path.exists(app.config['UPLOAD_FOLDER']),
                    "writable": os.access(app.config['UPLOAD_FOLDER'], os.W_OK) if os.path.exists(app.config['UPLOAD_FOLDER']) else False,
                    "files_count": len(os.listdir(app.config['UPLOAD_FOLDER'])) if os.path.exists(app.config['UPLOAD_FOLDER']) else 0
                },
                "processed": {
                    "path": app.config['PROCESSED_FOLDER'],
                    "exists": os.path.exists(app.config['PROCESSED_FOLDER']),
                    "writable": os.access(app.config['PROCESSED_FOLDER'], os.W_OK) if os.path.exists(app.config['PROCESSED_FOLDER']) else False,
                    "files_count": len(os.listdir(app.config['PROCESSED_FOLDER'])) if os.path.exists(app.config['PROCESSED_FOLDER']) else 0
                }
            }
        }
        
        return jsonify(status), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    # Logs de débogage pour diagnostiquer les problèmes en production
    logger.info("=" * 50)
    logger.info("🚀 NOUVELLE REQUÊTE D'UPLOAD REÇUE")
    logger.info(f"📍 Origin: {request.headers.get('Origin', 'Non spécifié')}")
    logger.info(f"🌐 User-Agent: {request.headers.get('User-Agent', 'Non spécifié')}")
    logger.info(f"🔗 Referer: {request.headers.get('Referer', 'Non spécifié')}")
    logger.info(f"📊 Content-Type: {request.headers.get('Content-Type', 'Non spécifié')}")
    logger.info(f"📏 Content-Length: {request.headers.get('Content-Length', 'Non spécifié')}")
    
    if 'file' not in request.files:
        logger.error("❌ Aucun fichier dans la requête")
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    logger.info(f"📄 Fichier reçu: {file.filename} (taille: {file.content_length if hasattr(file, 'content_length') else 'inconnue'})")
    
    # Récupérer tous les paramètres du formulaire
    language = request.form.get('language', 'en')
    company_id = request.form.get('companyId', '')
    periodicity = request.form.get('periodicity', 'Q')
    year = request.form.get('year', datetime.now().year)
    
    # Récupérer et parser les KPIs sélectionnés
    kpis_json = request.form.get('kpis', '[]')
    try:
        selected_kpis = json.loads(kpis_json)
        if not isinstance(selected_kpis, list):
            selected_kpis = []
    except:
        selected_kpis = []
    
    logger.info(f"🎯 Paramètres reçus: langue={language}, périodicité={periodicity}, année={year}")
    logger.info(f"📋 KPIs sélectionnés: {selected_kpis}")

    if file.filename == '':
        logger.error("❌ Nom de fichier vide")
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = secure_filename(file.filename)
        base_filename = os.path.splitext(filename)[0]
        processing_id = f"{base_filename}_{timestamp}"
        saved_filename = f"{processing_id}.pdf"
        
        # Chemin complet du fichier PDF à sauvegarder
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], saved_filename)
        
        logger.info(f"Tentative de sauvegarde du PDF dans: {pdf_path}")
        
        # Vérifier que le dossier cible existe
        upload_dir = os.path.dirname(pdf_path)
        if not os.path.exists(upload_dir):
            logger.error(f"Le dossier de destination n'existe pas: {upload_dir}")
            try:
                os.makedirs(upload_dir, exist_ok=True)
                logger.info(f"Dossier créé: {upload_dir}")
            except Exception as dir_err:
                logger.error(f"Impossible de créer le dossier: {dir_err}")
                return jsonify({"error": f"Upload directory error: {str(dir_err)}"}), 500
        
        # Sauvegarder le fichier
        try:
            file.save(pdf_path)
            logger.info(f"Fichier sauvegardé à: {pdf_path}")
        except Exception as save_err:
            logger.error(f"Erreur lors de la sauvegarde du fichier: {save_err}", exc_info=True)
            return jsonify({"error": f"File save error: {str(save_err)}"}), 500
        
        # Vérifier que le fichier a bien été sauvegardé
        if not os.path.exists(pdf_path):
            logger.error(f"ÉCHEC: Le fichier n'existe pas après sauvegarde: {pdf_path}")
            return jsonify({"error": "Failed to save uploaded PDF - file does not exist after save"}), 500
            
        file_size = os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0
        logger.info(f"PDF reçu et sauvegardé: {pdf_path} ({file_size} octets)")
        
        try:
            # Traitement du PDF avec tous les paramètres et timeout
            logger.info(f"Début du traitement du PDF: {pdf_path}")
            timeout_seconds = app.config.get('PROCESSING_TIMEOUT', 600)  # 10 minutes par défaut
            
            try:
                processing_result = run_with_timeout(
                    pdf_processor.process_pdf,
                    timeout_seconds,
                    pdf_path=pdf_path,
                    output_folder=app.config['PROCESSED_FOLDER'],
                    requested_language=language,
                    periodicity=periodicity,
                    selected_kpis=selected_kpis,
                    year=year
                )
                logger.info(f"Traitement du PDF terminé: {pdf_path}")
            except TimeoutException as e:
                logger.error(f"Timeout du traitement PDF après {timeout_seconds} secondes: {e}")
                return jsonify({"error": f"Le traitement du PDF a pris trop de temps (>{timeout_seconds}s). Essayez avec un PDF plus petit ou contactez le support."}), 408

            # Vérifier les fichiers générés
            if os.path.exists(app.config['PROCESSED_FOLDER']):
                processed_files = os.listdir(app.config['PROCESSED_FOLDER'])
                logger.info(f"Fichiers générés dans {app.config['PROCESSED_FOLDER']}: {processed_files}")
            else:
                logger.warning(f"Le dossier de traitement n'existe pas après traitement: {app.config['PROCESSED_FOLDER']}")

            # Vérifier s'il y a une erreur dans le résultat
            if "error" in processing_result and not processing_result.get("extracted_data"):
                # Si une erreur majeure s'est produite (pas de données extraites)
                logger.error(f"Erreur renvoyée par process_pdf: {processing_result['error']}")
                return jsonify({"error": processing_result['error']}), 500
            else:
                # Définir l'URL de base
                host = request.host_url.rstrip('/')
                
                # Corriger le protocole pour HTTPS en production
                if 'tryprospero.fr' in host and host.startswith('http://'):
                    host = host.replace('http://', 'https://')
                
                # Construire les URLs pour le frontend avec le bon préfixe pour le reverse proxy
                pdf_url = f"{host}/api/pdf-processor/uploads/{saved_filename}"
                
                # Vérifier et ajuster les URLs des images
                image_urls = []
                if processing_result.get("image_urls"):
                    for img_url in processing_result.get("image_urls"):
                        # Extraire le nom du fichier de l'URL si nécessaire
                        img_filename = os.path.basename(img_url)
                        full_img_url = f"{host}/api/pdf-processor/processed/{img_filename}"
                        # Vérifier que l'image existe avant de l'ajouter
                        img_path = os.path.join(app.config['PROCESSED_FOLDER'], img_filename)
                        if os.path.exists(img_path):
                            image_urls.append(full_img_url)
                            logger.info(f"Image disponible: {full_img_url}")
                        else:
                            logger.warning(f"Image non trouvée: {img_path}")
                
                logger.info(f"PDF URL: {pdf_url}")
                logger.info(f"Images URLs: {len(image_urls)} images")
                
                # Préparer la réponse
                response_data = {
                    "message": "File processed successfully",
                    "processing_id": processing_id,
                    "company_id": company_id,
                    "data": processing_result.get("extracted_data"),
                    "image_urls": image_urls,
                    "pdf_url": pdf_url,
                    "periodicity": periodicity,
                    "selected_kpis": selected_kpis,
                    "year": year,
                    "text": processing_result.get("extracted_text", ""),
                    "periods": processing_result.get("periods", [])
                }
                
                # Ajouter un avertissement si présent
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
    logger.warning(f"NETTOYAGE DÉSACTIVÉ: les fichiers ne seront plus supprimés automatiquement")
    
    # DÉSACTIVÉ: On ne supprime plus les fichiers pour pouvoir les afficher
    # Retourner quand même un succès pour que le front ne soit pas bloqué
    return jsonify({"message": f"Cleanup skipped for ID: {processing_id}. Files preserved."}), 200

    # L'ancien code de nettoyage est commenté ci-dessous
    """
    # Chemin du PDF original
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{processing_id}.pdf")
    safe_delete(pdf_path)

    # Chemins des images potentielles
    for i in range(1, 101):
        img_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{processing_id}_page_{i}.jpg")
        safe_delete(img_path)

    # Nettoyer aussi le fichier JSON de résultat
    result_json_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{processing_id}_vision_results.json")
    safe_delete(result_json_path)

    return jsonify({"message": f"Cleanup attempted for ID: {processing_id}"}), 200
    """

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

@app.route('/test-file-access', methods=['GET'])
def test_file_access():
    """Vérifie l'accès aux dossiers de stockage et leurs permissions."""
    import platform
    from datetime import datetime
    import tempfile
    
    result = {
        "timestamp": datetime.now().isoformat(),
        "os": platform.system(),
        "platform": platform.platform(),
        "folders": {},
        "tests": {}
    }
    
    # Vérifier les dossiers
    folders_to_check = {
        "uploads": app.config['UPLOAD_FOLDER'],
        "processed": app.config['PROCESSED_FOLDER'],
        "app_dir": os.path.dirname(os.path.abspath(__file__)),
        "temp_dir": tempfile.gettempdir()
    }
    
    for name, path in folders_to_check.items():
        folder_info = {
            "path": path,
            "exists": os.path.exists(path),
            "is_dir": os.path.isdir(path) if os.path.exists(path) else False,
            "readable": os.access(path, os.R_OK) if os.path.exists(path) else False,
            "writable": os.access(path, os.W_OK) if os.path.exists(path) else False,
            "executable": os.access(path, os.X_OK) if os.path.exists(path) else False
        }
        
        # Ajouter des informations supplémentaires si le dossier existe
        if folder_info["exists"] and folder_info["is_dir"]:
            try:
                stats = os.stat(path)
                folder_info["owner_id"] = stats.st_uid
                folder_info["group_id"] = stats.st_gid
                folder_info["permissions"] = oct(stats.st_mode)
                
                # Essayer de lister les fichiers
                try:
                    files = os.listdir(path)
                    folder_info["files"] = files
                    folder_info["file_count"] = len(files)
                except Exception as e:
                    folder_info["files_error"] = str(e)
            except Exception as e:
                folder_info["stats_error"] = str(e)
        
        result["folders"][name] = folder_info
    
    # Tester la création de fichiers
    test_results = {}
    for folder_name in ["uploads", "processed"]:
        folder_path = folders_to_check[folder_name]
        if os.path.exists(folder_path) and os.access(folder_path, os.W_OK):
            test_file_path = os.path.join(folder_path, f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}.txt")
            try:
                with open(test_file_path, 'w') as f:
                    f.write(f"Test file created at {datetime.now().isoformat()}")
                test_results[folder_name] = {
                    "file_creation": "success",
                    "path": test_file_path,
                    "exists": os.path.exists(test_file_path)
                }
                # Supprimer le fichier après le test
                try:
                    os.remove(test_file_path)
                    test_results[folder_name]["file_deletion"] = "success"
                except Exception as e:
                    test_results[folder_name]["file_deletion"] = f"error: {str(e)}"
            except Exception as e:
                test_results[folder_name] = {
                    "file_creation": f"error: {str(e)}",
                    "path": test_file_path
                }
        else:
            test_results[folder_name] = {
                "file_creation": "skipped - folder not writable or does not exist"
            }
    
    result["tests"] = test_results
    return jsonify(result)

@app.route('/test-folders', methods=['GET'])
def test_folders():
    """Test direct des dossiers et création de fichiers de test."""
    import platform
    from datetime import datetime
    import uuid
    import tempfile
    
    result = {
        "timestamp": datetime.now().isoformat(),
        "os": platform.system(),
        "platform": platform.platform(),
        "folders": {},
        "test_files": {}
    }
    
    # Test des dossiers
    folders_to_test = {
        "uploads": app.config['UPLOAD_FOLDER'],
        "processed": app.config['PROCESSED_FOLDER']
    }
    
    # Forcer la création des dossiers s'ils n'existent pas
    for name, folder_path in folders_to_test.items():
        try:
            os.makedirs(folder_path, exist_ok=True)
            # Tenter de définir des permissions totales
            try:
                os.chmod(folder_path, 0o777)
            except Exception as e:
                result[f"{name}_chmod_error"] = str(e)
                
            folder_info = {
                "path": folder_path,
                "abs_path": os.path.abspath(folder_path),
                "exists": os.path.exists(folder_path),
                "is_dir": os.path.isdir(folder_path) if os.path.exists(folder_path) else False,
                "writable": os.access(folder_path, os.W_OK) if os.path.exists(folder_path) else False,
                "file_list": os.listdir(folder_path) if os.path.exists(folder_path) and os.path.isdir(folder_path) else []
            }
            
            # Statistiques du dossier
            if folder_info["exists"]:
                try:
                    stats = os.stat(folder_path)
                    folder_info["owner"] = stats.st_uid
                    folder_info["group"] = stats.st_gid
                    folder_info["permissions"] = oct(stats.st_mode)
                except Exception as e:
                    folder_info["stats_error"] = str(e)
                    
            result["folders"][name] = folder_info
            
            # Générer un fichier de test dans ce dossier
            test_id = uuid.uuid4().hex[:8]
            test_file_path = os.path.join(folder_path, f"test_{test_id}.txt")
            
            try:
                with open(test_file_path, 'w') as f:
                    f.write(f"Test de création de fichier - {datetime.now().isoformat()}")
                
                test_result = {
                    "path": test_file_path,
                    "exists": os.path.exists(test_file_path),
                    "size": os.path.getsize(test_file_path) if os.path.exists(test_file_path) else 0,
                    "status": "success" if os.path.exists(test_file_path) else "failed"
                }
                
                result["test_files"][name] = test_result
            except Exception as e:
                result["test_files"][name] = {
                    "path": test_file_path,
                    "error": str(e),
                    "status": "error"
                }
        except Exception as e:
            result["folders"][name] = {
                "path": folder_path,
                "error": str(e),
                "status": "error"
            }
    
    # Tester la création d'un PDF et sa conversion en image
    try:
        # Créer un PDF minimal avec reportlab
        try:
            from reportlab.pdfgen import canvas
            test_pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"test_pdf_{uuid.uuid4().hex[:8]}.pdf")
            
            c = canvas.Canvas(test_pdf_path)
            c.drawString(100, 750, f"PDF test créé le {datetime.now().isoformat()}")
            c.drawString(100, 700, "Ce PDF est généré pour tester le pipeline de traitement")
            c.save()
            
            result["test_pdf"] = {
                "path": test_pdf_path,
                "exists": os.path.exists(test_pdf_path),
                "size": os.path.getsize(test_pdf_path) if os.path.exists(test_pdf_path) else 0,
                "status": "success" if os.path.exists(test_pdf_path) else "failed"
            }
            
            # Maintenant, essayer de convertir ce PDF en image
            if os.path.exists(test_pdf_path):
                try:
                    from pdf2image import convert_from_path
                    
                    output_path = os.path.join(app.config['PROCESSED_FOLDER'], f"test_image_{uuid.uuid4().hex[:8]}.jpg")
                    pages = convert_from_path(test_pdf_path, single_file=True, output_folder=app.config['PROCESSED_FOLDER'])
                    
                    if pages and len(pages) > 0:
                        pages[0].save(output_path, "JPEG")
                        
                        result["test_image"] = {
                            "path": output_path,
                            "exists": os.path.exists(output_path),
                            "size": os.path.getsize(output_path) if os.path.exists(output_path) else 0,
                            "status": "success" if os.path.exists(output_path) else "failed"
                        }
                    else:
                        result["test_image"] = {
                            "error": "Aucune page générée",
                            "status": "failed"
                        }
                except Exception as img_err:
                    result["test_image"] = {
                        "error": str(img_err),
                        "status": "error"
                    }
        except ImportError:
            result["test_pdf"] = {
                "error": "reportlab n'est pas installé",
                "status": "skipped"
            }
    except Exception as e:
        result["test_pdf"] = {
            "error": str(e),
            "status": "error"
        }
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 