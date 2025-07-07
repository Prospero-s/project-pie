#!/bin/bash

# Script pour ajouter les permissions CloudWatch Logs à l'IAM role EC2
# À exécuter depuis votre machine locale (avec AWS CLI configuré)

set -e

echo "🔐 Ajout des permissions CloudWatch Logs à l'IAM role EC2..."

# Variables
ROLE_NAME="ProsperoEC2Role"  # Nom de votre rôle IAM EC2

# Vérifier que l'AWS CLI est configuré
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI n'est pas configuré"
    echo "📋 Configurez AWS CLI avec : aws configure"
    exit 1
fi

# Ajouter la policy CloudWatchLogsFullAccess
echo "📋 Ajout de la policy CloudWatchLogsFullAccess..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# Ajouter la policy CloudWatchAgentServerPolicy
echo "📋 Ajout de la policy CloudWatchAgentServerPolicy..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy

# Vérifier les policies attachées
echo "📊 Vérification des policies attachées au rôle $ROLE_NAME :"
aws iam list-attached-role-policies --role-name $ROLE_NAME --query 'AttachedPolicies[].PolicyName' --output table

echo "✅ Permissions CloudWatch Logs ajoutées avec succès !"
echo ""
echo "🎯 Prochaines étapes :"
echo "   1. Redémarrez votre instance EC2 pour appliquer les nouvelles permissions"
echo "   2. SSH vers votre EC2 et exécutez : bash scripts/setup-cloudwatch-logs.sh"
echo "   3. Vos logs seront visibles dans AWS Console → CloudWatch → Logs" 