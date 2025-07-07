#!/bin/bash

# Script d'installation des dépendances pour CodeDeploy
# Hook: AfterInstall

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

log_message "📦 INSTALLATION DES DÉPENDANCES - CodeDeploy"

# Aller dans le répertoire du projet
cd /home/ec2-user/project-pie

# 1. Préserver le .env de production
log_message "🔒 Préservation du fichier .env de production..."
if [ -f /home/ec2-user/.env.production ]; then
    log_message "✅ Restauration du .env de production"
    cp /home/ec2-user/.env.production .env
else
    log_message "⚠️ Pas de .env de production sauvegardé"
    if [ -f .env.example ]; then
        log_message "📋 Copie de .env.example vers .env"
        cp .env.example .env
    fi
fi

# 2. Sauvegarder le .env actuel pour le prochain déploiement
log_message "💾 Sauvegarde du .env pour le prochain déploiement..."
cp .env /home/ec2-user/.env.production

# 3. Vérifier si Docker et Docker Compose sont disponibles
if ! command -v docker &> /dev/null; then
    log_message "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_message "❌ Docker Compose n'est pas installé"
    exit 1
fi

# 4. Installer les dépendances Composer en local si possible
log_message "📦 Installation des dépendances Composer..."
if command -v composer &> /dev/null; then
    log_message "🎯 Installation Composer locale..."
    if composer install --no-dev --optimize-autoloader --no-interaction; then
        log_message "✅ Dépendances Composer installées (local)"
    else
        log_message "⚠️ Échec de l'installation Composer locale"
    fi
else
    log_message "⚠️ Composer non disponible localement"
fi

# 5. Installer les dépendances Node.js en local si possible
log_message "📦 Installation des dépendances Node.js..."
if command -v npm &> /dev/null; then
    log_message "🎯 Installation npm locale..."
    if npm install --production --no-cache; then
        log_message "✅ Dépendances Node.js installées (local)"
    else
        log_message "⚠️ Échec de l'installation npm locale"
    fi
else
    log_message "⚠️ npm non disponible localement"
fi

# 6. Build des assets si possible
log_message "🏗️ Build des assets..."
if command -v npm &> /dev/null; then
    if npm run build; then
        log_message "✅ Build des assets terminé"
    else
        log_message "⚠️ Échec du build des assets"
    fi
else
    log_message "⚠️ npm non disponible pour le build"
fi

# 7. Définir les permissions appropriées
log_message "🔐 Configuration des permissions..."
chown -R ec2-user:ec2-user /home/ec2-user/project-pie
chmod +x scripts/codedeploy/*.sh
log_message "✅ Permissions configurées"

log_message "✅ Installation des dépendances terminée" 