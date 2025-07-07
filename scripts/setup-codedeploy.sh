#!/bin/bash

# Script de configuration AWS CodeDeploy pour EC2
# À exécuter sur l'instance EC2

set -e

echo "🚀 Configuration AWS CodeDeploy sur EC2..."

# Vérifier si l'agent CodeDeploy est déjà installé
if systemctl is-active --quiet codedeploy-agent; then
    echo "✅ Agent CodeDeploy déjà installé et actif"
else
    echo "📦 Installation de l'agent CodeDeploy..."
    
    # Télécharger et installer l'agent CodeDeploy
    cd /tmp
    wget https://aws-codedeploy-eu-west-3.s3.eu-west-3.amazonaws.com/latest/install
    chmod +x ./install
    sudo ./install auto
    
    # Démarrer et activer le service
    sudo systemctl enable codedeploy-agent
    sudo systemctl start codedeploy-agent
    
    # Vérifier l'installation
    if systemctl is-active --quiet codedeploy-agent; then
        echo "✅ Agent CodeDeploy installé et démarré"
    else
        echo "❌ Échec de l'installation de l'agent CodeDeploy"
        exit 1
    fi
fi

# Créer le répertoire pour les scripts CodeDeploy
echo "📁 Création des répertoires CodeDeploy..."
sudo mkdir -p /opt/codedeploy-agent/deployment-root
sudo chown ec2-user:ec2-user /opt/codedeploy-agent/deployment-root

# Créer le fichier appspec.yml dans le projet
echo "📋 Création du fichier appspec.yml..."
cat > /home/ec2-user/project-pie/appspec.yml << 'EOF'
version: 0.0
os: linux
files:
  - source: /
    destination: /home/ec2-user/project-pie
    overwrite: yes
    file_exists_behavior: OVERWRITE
hooks:
  BeforeInstall:
    - location: scripts/codedeploy/stop-application.sh
      timeout: 300
      runas: ec2-user
  ApplicationStart:
    - location: scripts/codedeploy/start-application.sh
      timeout: 300
      runas: ec2-user
  ApplicationStop:
    - location: scripts/codedeploy/stop-application.sh
      timeout: 300
      runas: ec2-user
  ValidateService:
    - location: scripts/codedeploy/validate-service.sh
      timeout: 300
      runas: ec2-user
EOF

# Créer le répertoire pour les scripts CodeDeploy
mkdir -p /home/ec2-user/project-pie/scripts/codedeploy

echo "✅ Configuration CodeDeploy terminée!"
echo ""
echo "🎯 Prochaines étapes:"
echo "   1. Créer les scripts CodeDeploy dans scripts/codedeploy/"
echo "   2. Configurer IAM role pour l'instance EC2"
echo "   3. Créer l'application CodeDeploy dans AWS Console"
echo "   4. Configurer GitHub Actions pour déclencher CodeDeploy"
echo ""
echo "📋 Vérification:"
echo "   • Statut agent: sudo systemctl status codedeploy-agent"
echo "   • Logs agent:   sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log" 