#!/bin/bash

# Script d'arrêt de l'application pour CodeDeploy
# Hook: BeforeInstall et ApplicationStop

set -e

LOG_DIR="/var/log/project-pie"
LOG_FILE="${LOG_DIR}/codedeploy.log"

# Créer le répertoire de logs s'il n'existe pas
sudo mkdir -p "$LOG_DIR"
sudo chown ec2-user:ec2-user "$LOG_DIR"

# Fonction de log
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_message "🔴 ARRÊT DE L'APPLICATION - CodeDeploy"

# Aller dans le répertoire du projet
cd /home/ec2-user/project-pie

# Arrêter les services Docker
log_message "🛑 Arrêt des services Docker..."
if make down 2>/dev/null; then
    log_message "✅ Services Docker arrêtés avec succès"
else
    log_message "⚠️ Aucun service Docker à arrêter ou erreur mineure"
fi

log_message "🔴 Arrêt terminé" 