#!/bin/bash

# Script de démarrage de l'application pour CodeDeploy
# Hook: ApplicationStart

set -e

LOG_DIR="/var/log/project-pie"
LOG_FILE="${LOG_DIR}/codedeploy.log"

# Fonction de log
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_message "🚀 DÉMARRAGE DE L'APPLICATION - CodeDeploy"

# Aller dans le répertoire du projet
cd /home/ec2-user/project-pie

# Afficher la version Git déployée
if command -v git &> /dev/null; then
    CURRENT_COMMIT=$(git rev-parse HEAD)
    log_message "📋 Version déployée: $CURRENT_COMMIT"
else
    log_message "⚠️ Git non disponible pour afficher la version"
fi

# Vérifier si Docker et Docker Compose sont disponibles
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    log_message "🐳 Démarrage des services Docker..."
    
    # Méthode 1 : Utiliser le Makefile si disponible
    if [ -f Makefile ] && command -v make &> /dev/null; then
        log_message "🎯 Utilisation du Makefile..."
        if make restart-prod; then
            log_message "✅ Services redémarrés avec succès via Makefile"
        else
            log_message "⚠️ Échec du redémarrage via Makefile, tentative alternative..."
            # Fallback : utiliser docker-compose directement
            docker-compose -f compose.yaml -f compose.prod.yaml down || true
            docker-compose -f compose.yaml -f compose.prod.yaml up -d --build
            log_message "✅ Services redémarrés avec succès via docker-compose"
        fi
    else
        log_message "🎯 Utilisation directe de docker-compose..."
        docker-compose -f compose.yaml -f compose.prod.yaml down || true
        docker-compose -f compose.yaml -f compose.prod.yaml up -d --build
        log_message "✅ Services redémarrés avec succès via docker-compose"
    fi
    
    # Attendre que les services soient prêts
    log_message "⏳ Attente que les services soient prêts..."
    sleep 20
    
    # Vérifier l'état des services
    if docker-compose ps | grep -q "Up"; then
        log_message "✅ Services Docker actifs"
    else
        log_message "⚠️ Certains services peuvent ne pas être actifs"
    fi
    
else
    log_message "⚠️ Docker non disponible, démarrage en mode standalone"
    
    # Si on utilise FrankenPHP directement (sans Docker)
    if [ -f bin/console ]; then
        log_message "🎯 Nettoyage du cache Symfony..."
        if php bin/console cache:clear --env=prod --no-interaction; then
            log_message "✅ Cache Symfony nettoyé"
        else
            log_message "⚠️ Échec du nettoyage du cache"
        fi
    fi
    
    # Démarrer le serveur web si nécessaire
    log_message "🌐 Vérification du serveur web..."
    if command -v systemctl &> /dev/null; then
        if systemctl is-active --quiet nginx; then
            log_message "✅ Nginx actif"
        elif systemctl is-active --quiet apache2; then
            log_message "✅ Apache actif"
        else
            log_message "⚠️ Aucun serveur web standard détecté"
        fi
    fi
fi

log_message "✅ Démarrage de l'application terminé" 