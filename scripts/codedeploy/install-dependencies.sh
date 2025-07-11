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

# 4. Démarrer les containers Docker d'abord avec make restart-prod
log_message "🐳 Démarrage des containers Docker pour la production..."
if make restart-prod; then
    log_message "✅ Containers Docker de production démarrés"
    
    # Attendre que les containers soient prêts avec vérification
    log_message "⏳ Attente que les containers soient prêts..."
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep -q "Up"; then
            log_message "✅ Containers détectés comme démarrés"
            break
        fi
        log_message "⏳ Attente des containers... ($((attempt + 1))/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_message "❌ Timeout : Les containers ne sont pas prêts après 5 minutes"
        exit 1
    fi
    
    # Attendre encore un peu pour que les services internes soient prêts
    log_message "⏳ Attente supplémentaire pour les services internes..."
    sleep 20
    
    # 5. Vérifier que le container PHP est accessible
    log_message "🔍 Vérification que le container PHP est accessible..."
    if ! docker-compose exec -T php php --version; then
        log_message "❌ Le container PHP n'est pas accessible"
        exit 1
    fi
    
    # 6. Installation des dépendances dans le container (workflow habituel)
    log_message "📦 Installation des dépendances Composer dans le container..."
    if docker-compose exec -T php composer install --no-dev --optimize-autoloader --no-interaction; then
        log_message "✅ Dépendances Composer installées"
    else
        log_message "❌ Échec de l'installation Composer"
        exit 1
    fi
    
    # 7. Installation des dépendances npm dans le container
    log_message "📦 Installation des dépendances npm dans le container..."
    if docker-compose exec -T php npm install --production --no-cache; then
        log_message "✅ Dépendances npm installées"
    else
        log_message "❌ Échec de l'installation npm"
        exit 1
    fi
    
    # 8. Build des assets dans le container
    log_message "🏗️ Build des assets dans le container..."
    if docker-compose exec -T php npm run build; then
        log_message "✅ Assets buildés avec succès"
    else
        log_message "❌ Échec du build des assets"
        exit 1
    fi
    
else
    log_message "❌ Échec du démarrage des containers Docker"
    exit 1
fi

log_message "✅ Installation des dépendances terminée" 