#!/bin/bash

# Script pour préparer le .env de production sur EC2
# À exécuter UNE SEULE FOIS avant le premier déploiement CodeDeploy

set -e

echo "🔐 Préparation du fichier .env de production..."

# Aller dans le répertoire du projet
cd /home/ec2-user/project-pie

# Vérifier si le .env existe
if [ ! -f .env ]; then
    echo "❌ Pas de fichier .env trouvé"
    if [ -f .env.example ]; then
        echo "📋 Copie de .env.example vers .env"
        cp .env.example .env
    else
        echo "❌ Pas de .env.example non plus !"
        exit 1
    fi
fi

# Sauvegarder le .env actuel pour les futurs déploiements
echo "💾 Sauvegarde du .env pour les futurs déploiements CodeDeploy..."
cp .env /home/ec2-user/.env.production

echo "✅ .env préparé avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Éditez le fichier .env avec vos vraies valeurs de production"
echo "   2. Exécutez à nouveau ce script pour sauvegarder les changements"
echo "   3. Lancez votre premier déploiement CodeDeploy"
echo ""
echo "📝 Commandes utiles :"
echo "   nano .env                    # Éditer le .env"
echo "   bash scripts/prepare-env.sh  # Sauvegarder les changements"
echo "   cat /home/ec2-user/.env.production  # Voir le .env sauvegardé" 