#!/bin/bash

# Script pour configurer les logs sur EC2
# À exécuter UNE SEULE FOIS sur l'instance EC2

set -e

echo "📋 Configuration des logs sur EC2..."

# Créer le répertoire de logs avec les bonnes permissions
sudo mkdir -p /var/log/project-pie
sudo chown ec2-user:ec2-user /var/log/project-pie
sudo chmod 755 /var/log/project-pie

# Créer les fichiers de logs
touch /var/log/project-pie/deployment.log
touch /var/log/project-pie/codedeploy.log
chmod 644 /var/log/project-pie/*.log

# Créer un script pour voir les logs facilement
cat > /home/ec2-user/view-logs.sh << 'EOF'
#!/bin/bash
echo "=== LOGS DE DÉPLOIEMENT ==="
echo "Fichier: /var/log/project-pie/deployment.log"
echo "Dernières 50 lignes:"
echo "---"
tail -n 50 /var/log/project-pie/deployment.log
echo ""
echo "=== LOGS CODEDEPLOY ==="
echo "Fichier: /var/log/project-pie/codedeploy.log"
echo "Dernières 50 lignes:"
echo "---"
tail -n 50 /var/log/project-pie/codedeploy.log
echo ""
echo "=== LOGS AGENT CODEDEPLOY ==="
echo "Fichier: /var/log/aws/codedeploy-agent/codedeploy-agent.log"
echo "Dernières 20 lignes:"
echo "---"
sudo tail -n 20 /var/log/aws/codedeploy-agent/codedeploy-agent.log
EOF

chmod +x /home/ec2-user/view-logs.sh

echo "✅ Logs configurés avec succès!"
echo ""
echo "📋 Fichiers de logs créés:"
echo "   • /var/log/project-pie/deployment.log (logs script update-prod.sh)"
echo "   • /var/log/project-pie/codedeploy.log (logs scripts CodeDeploy)"
echo "   • /var/log/aws/codedeploy-agent/codedeploy-agent.log (logs agent CodeDeploy)"
echo ""
echo "📋 Commandes utiles:"
echo "   • ./view-logs.sh                    - Voir tous les logs"
echo "   • tail -f /var/log/project-pie/deployment.log  - Suivre en temps réel"
echo "   • tail -f /var/log/project-pie/codedeploy.log   - Suivre CodeDeploy"
echo ""
echo "🎯 Maintenant vos déploiements seront loggés !" 