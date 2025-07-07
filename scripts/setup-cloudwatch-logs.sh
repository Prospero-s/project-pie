#!/bin/bash

# Script pour configurer AWS CloudWatch Logs pour CodeDeploy
# À exécuter UNE SEULE FOIS sur l'instance EC2

set -e

echo "☁️ Configuration AWS CloudWatch Logs pour CodeDeploy..."

# Vérifier que l'instance a les bonnes permissions IAM
echo "🔐 Vérification des permissions IAM..."
aws sts get-caller-identity > /dev/null 2>&1 || {
    echo "❌ Erreur : L'instance n'a pas les bonnes permissions AWS"
    echo "📋 Assurez-vous que l'instance EC2 a les policies :"
    echo "   • CloudWatchLogsFullAccess"
    echo "   • CloudWatchAgentServerPolicy"
    exit 1
}

# Récupérer la région AWS
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone | sed 's/[a-z]$//')
echo "📍 Région détectée : $REGION"

# Installer l'agent CloudWatch Logs
echo "📦 Installation de l'agent CloudWatch Logs..."

# Télécharger les fichiers nécessaires
cd /tmp
wget https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/awslogs-agent-setup.py
wget https://s3.amazonaws.com/aws-codedeploy-${REGION}/cloudwatch/codedeploy_logs.conf

# Créer le fichier de configuration principal
cat > awslogs.conf << EOF
[general]
state_file = /var/awslogs/state/agent-state

[/var/log/aws/codedeploy-agent/codedeploy-agent.log]
file = /var/log/aws/codedeploy-agent/codedeploy-agent.log
log_group_name = codedeploy-agent-logs
log_stream_name = {instance_id}-codedeploy-agent

[/opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log]
file = /opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log
log_group_name = codedeploy-deployment-logs
log_stream_name = {instance_id}-codedeploy-deployment

[/var/log/project-pie/codedeploy.log]
file = /var/log/project-pie/codedeploy.log
log_group_name = project-pie-codedeploy-logs
log_stream_name = {instance_id}-project-pie-codedeploy

[/var/log/project-pie/deployment.log]
file = /var/log/project-pie/deployment.log
log_group_name = project-pie-deployment-logs
log_stream_name = {instance_id}-project-pie-deployment
EOF

# Installer l'agent CloudWatch Logs
echo "🔧 Installation de l'agent CloudWatch Logs..."
chmod +x ./awslogs-agent-setup.py
sudo python ./awslogs-agent-setup.py -n -r $REGION -c ./awslogs.conf

# Configurer les logs CodeDeploy
echo "📋 Configuration des logs CodeDeploy..."
sudo mkdir -p /var/awslogs/etc/config
sudo cp codedeploy_logs.conf /var/awslogs/etc/config/ 2>/dev/null || {
    echo "⚠️ Fichier codedeploy_logs.conf non trouvé, création manuelle..."
    sudo cat > /var/awslogs/etc/config/codedeploy_logs.conf << 'EOF'
[/var/log/aws/codedeploy-agent/codedeploy-agent.log]
file = /var/log/aws/codedeploy-agent/codedeploy-agent.log
log_group_name = codedeploy-agent-logs
log_stream_name = {instance_id}-codedeploy-agent
datetime_format = %Y-%m-%d %H:%M:%S

[/opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log]
file = /opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log
log_group_name = codedeploy-deployment-logs
log_stream_name = {instance_id}-codedeploy-deployment
datetime_format = %Y-%m-%d %H:%M:%S
EOF
}

# Redémarrer l'agent CloudWatch Logs
echo "🔄 Redémarrage de l'agent CloudWatch Logs..."
sudo service awslogs restart

# Vérifier que le service est actif
if sudo service awslogs status | grep -q "running"; then
    echo "✅ Agent CloudWatch Logs démarré avec succès"
else
    echo "❌ Échec du démarrage de l'agent CloudWatch Logs"
    exit 1
fi

# Créer les groupes de logs dans CloudWatch
echo "📊 Création des groupes de logs dans CloudWatch..."
aws logs create-log-group --log-group-name codedeploy-agent-logs --region $REGION 2>/dev/null || echo "✅ Groupe codedeploy-agent-logs existe déjà"
aws logs create-log-group --log-group-name codedeploy-deployment-logs --region $REGION 2>/dev/null || echo "✅ Groupe codedeploy-deployment-logs existe déjà"
aws logs create-log-group --log-group-name project-pie-codedeploy-logs --region $REGION 2>/dev/null || echo "✅ Groupe project-pie-codedeploy-logs existe déjà"
aws logs create-log-group --log-group-name project-pie-deployment-logs --region $REGION 2>/dev/null || echo "✅ Groupe project-pie-deployment-logs existe déjà"

echo "✅ CloudWatch Logs configuré avec succès !"
echo ""
echo "📋 Vos logs seront maintenant visibles dans :"
echo "   • AWS Console → CloudWatch → Logs"
echo "   • Groupes de logs :"
echo "     - codedeploy-agent-logs"
echo "     - codedeploy-deployment-logs"
echo "     - project-pie-codedeploy-logs"
echo "     - project-pie-deployment-logs"
echo ""
echo "🔧 Commandes utiles :"
echo "   • sudo service awslogs status    # Vérifier l'agent"
echo "   • sudo service awslogs restart   # Redémarrer l'agent"
echo "   • tail -f /var/awslogs/logs/awslogs.log  # Logs de l'agent" 