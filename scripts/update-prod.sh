#!/bin/bash
set -e

# Configuration des logs
LOG_DIR="/var/log/project-pie"
LOG_FILE="${LOG_DIR}/deployment.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Fonction pour logger avec timestamp
log_message() {
    echo "[${TIMESTAMP}] $1" | tee -a "${LOG_FILE}"
}

# Fonction pour logger les erreurs
log_error() {
    echo "[${TIMESTAMP}] ERROR: $1" | tee -a "${LOG_FILE}" >&2
}

# Créer le répertoire de logs s'il n'existe pas
sudo mkdir -p "${LOG_DIR}"
sudo chown ec2-user:ec2-user "${LOG_DIR}"

# Rediriger toutes les sorties vers le fichier de log en plus de la console
exec > >(tee -a "${LOG_FILE}")
exec 2>&1

log_message "🚀 DÉBUT DU DÉPLOIEMENT - Mise à jour de la branche rebase-dev"
log_message "📋 Utilisateur: $(whoami)"
log_message "📋 Répertoire de travail: $(pwd)"
log_message "📋 Version Git avant: $(cd /home/ec2-user/project-pie && git rev-parse HEAD)"

# Aller dans le répertoire du projet
cd /home/ec2-user/project-pie

# Vérifier l'état de Git
log_message "📊 État Git avant mise à jour:"
git status --porcelain

# Simple git pull
log_message "📥 Git pull..."
if git pull; then
    log_message "✅ Git pull réussi"
    log_message "📋 Version Git après: $(git rev-parse HEAD)"
else
    log_error "❌ Échec du git pull"
    exit 1
fi

log_message "🔄 Redémarrage des services production..."
# Utiliser la nouvelle commande restart-prod
if make restart-prod; then
    log_message "✅ Services redémarrés avec succès"
else
    log_error "❌ Échec du redémarrage des services"
    exit 1
fi

log_message "📦 Build des assets..."
# Build dans le container PHP
if make shell -c "npm run build"; then
    log_message "✅ Build des assets réussi"
else
    log_error "❌ Échec du build des assets"
    exit 1
fi

log_message "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS - $(date)"
log_message "=================================================="
echo "" 