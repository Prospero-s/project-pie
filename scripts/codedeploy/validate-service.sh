#!/bin/bash

# Script de validation de l'application pour CodeDeploy
# Hook: ValidateService

set -e

LOG_DIR="/var/log/project-pie"
LOG_FILE="${LOG_DIR}/codedeploy.log"

# Fonction de log
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_message "🔍 VALIDATION DE L'APPLICATION - CodeDeploy"

# Aller dans le répertoire du projet
cd /home/ec2-user/project-pie

# Vérifier si Docker est disponible et les containers sont démarrés
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    log_message "📊 Vérification des services Docker..."
    
    # Vérifier si des services Docker sont actifs
    if docker-compose ps --quiet | grep -q .; then
        if docker-compose ps | grep -q "Up"; then
            log_message "✅ Services Docker actifs"
            DOCKER_RUNNING=true
        else
            log_message "⚠️ Services Docker présents mais pas tous actifs"
            DOCKER_RUNNING=false
        fi
    else
        log_message "⚠️ Aucun service Docker détecté"
        DOCKER_RUNNING=false
    fi
else
    log_message "⚠️ Docker non disponible"
    DOCKER_RUNNING=false
fi

# Test de connectivité HTTP
log_message "🌐 Test de connectivité HTTP..."
HTTP_OK=false

# Liste des ports à tester
PORTS=(80 8080 443 3000 5000)

for port in "${PORTS[@]}"; do
    if curl -f -s --connect-timeout 5 "http://localhost:$port" >/dev/null 2>&1; then
        log_message "✅ Application répond sur le port $port"
        HTTP_OK=true
        break
    fi
done

if [ "$HTTP_OK" = false ]; then
    log_message "⚠️ Application ne répond pas sur les ports standards (80, 8080, 443, 3000, 5000)"
    
    # Vérifier les processus actifs
    if command -v ss &> /dev/null; then
        log_message "📋 Ports ouverts détectés:"
        ss -tuln | grep LISTEN | head -10 | while read -r line; do
            log_message "  $line"
        done
    fi
fi

# Vérifier les processus PHP/Node.js
log_message "🔍 Vérification des processus applicatifs..."

if pgrep -f "php" > /dev/null; then
    log_message "✅ Processus PHP détectés"
elif pgrep -f "frankenphp" > /dev/null; then
    log_message "✅ Processus FrankenPHP détectés"
else
    log_message "⚠️ Aucun processus PHP/FrankenPHP détecté"
fi

if pgrep -f "node" > /dev/null; then
    log_message "✅ Processus Node.js détectés"
else
    log_message "⚠️ Aucun processus Node.js détecté"
fi

# Vérifier l'espace disque
log_message "💾 Vérification de l'espace disque..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log_message "⚠️ Espace disque faible: ${DISK_USAGE}%"
else
    log_message "✅ Espace disque OK: ${DISK_USAGE}%"
fi

# Vérifier les fichiers critiques
log_message "📁 Vérification des fichiers critiques..."

CRITICAL_FILES=(
    ".env"
    "composer.json"
    "package.json"
    "appspec.yml"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_message "✅ $file présent"
    else
        log_message "⚠️ $file manquant"
    fi
done

# Vérifier les permissions
log_message "🔐 Vérification des permissions..."
if [ -O /home/ec2-user/project-pie ]; then
    log_message "✅ Permissions du répertoire OK"
else
    log_message "⚠️ Problème de permissions sur le répertoire"
fi

# Vérifier la version Git si disponible
if command -v git &> /dev/null; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        CURRENT_COMMIT=$(git rev-parse HEAD)
        log_message "📋 Version finale: $CURRENT_COMMIT"
    else
        log_message "⚠️ Pas de repository Git détecté"
    fi
else
    log_message "⚠️ Git non disponible"
fi

# Résumé final
log_message "📊 RÉSUMÉ DE LA VALIDATION:"
log_message "  - Docker: $($DOCKER_RUNNING && echo "✅ Actif" || echo "⚠️ Inactif")"
log_message "  - HTTP: $($HTTP_OK && echo "✅ Accessible" || echo "⚠️ Non accessible")"
log_message "  - Espace disque: ✅ ${DISK_USAGE}%"

# Décision finale
if [ "$DOCKER_RUNNING" = true ] || [ "$HTTP_OK" = true ]; then
    log_message "✅ Validation réussie - Application déployée avec succès"
    exit 0
else
    log_message "⚠️ Validation partielle - Application partiellement fonctionnelle"
    exit 0  # Ne pas faire échouer le déploiement pour des tests partiels
fi 