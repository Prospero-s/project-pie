# 🚀 Tutoriel AWS CodeDeploy - Déploiement automatique

## 🎯 Objectif
**Automatiser le déploiement de votre projet sur EC2 à chaque fois qu'une merge request est validée sur la branche `rebase-dev`.**

## 📋 Ce que vous allez obtenir
- ✅ Déploiement automatique après merge sur `rebase-dev`
- ✅ Rollback automatique en cas d'échec
- ✅ Monitoring dans AWS Console
- ✅ Historique des déploiements
- ✅ Logs détaillés de chaque étape

---

## 🔧 ÉTAPE 1 : Configuration AWS (30 minutes)

### 1.1 Créer un bucket S3 pour les déploiements

**AWS Console → S3 → Créer un bucket**
- **Nom du bucket :** `project-pie-deployments`
- **Région :** `eu-west-3` (même région que votre EC2)
- **Paramètres par défaut :** OK
- **Cliquez sur "Créer un bucket"**

### 1.2 Créer le rôle IAM pour CodeDeploy

**AWS Console → IAM → Rôles → Créer un rôle**

**Étape 1 :** Sélectionner le type d'entité de confiance
- Sélectionner : **Service AWS**
- Cas d'usage : **CodeDeploy**
- Cliquer sur **Suivant**

**Étape 2 :** Ajouter des autorisations
- La politique `AWSCodeDeployRole` est déjà sélectionnée
- Cliquer sur **Suivant**

**Étape 3 :** Détails du rôle
- **Nom du rôle :** `CodeDeployServiceRole`
- Cliquer sur **Créer un rôle**

### 1.3 Ajouter les permissions CloudWatch Logs à votre rôle EC2

**Sur votre machine locale (WSL) :**
```bash
# Ajouter les permissions CloudWatch Logs
bash scripts/add-cloudwatch-permissions.sh
```

**Alternative via AWS Console :**
- **AWS Console → IAM → Rôles → ProsperoEC2Role**
- **Attacher les policies :**
  - `CloudWatchLogsFullAccess`
  - `CloudWatchAgentServerPolicy`

### 1.4 Attacher le rôle à votre instance EC2

**AWS Console → EC2 → Instances**
- Sélectionner votre instance EC2
- **Actions → Sécurité → Modifier le rôle IAM**
- Sélectionner : `CodeDeployEC2Role`
- Cliquer sur **Mettre à jour le rôle IAM**

### 1.5 Ajouter des tags à votre instance EC2

**AWS Console → EC2 → Instances**
- Sélectionner votre instance EC2
- Onglet **Tags → Gérer les tags**
- Ajouter ces tags :
  - **Key:** `Environment` **Value:** `production`
  - **Key:** `Application` **Value:** `project-pie`
- Cliquer sur **Enregistrer**

---

## 🖥️ ÉTAPE 2 : Configuration sur EC2 (15 minutes)

### 2.1 Pousser le code vers GitHub

**Sur votre WSL local :**
```bash
cd project-pie
git add .
git commit -m "feat: add AWS CodeDeploy configuration"
git push origin feat/PROS-000-deployment-2
```

**Créer une PR vers `rebase-dev` et la merger**

### 2.2 Installation sur EC2

**SSH vers votre EC2 (PowerShell) :**
```bash
# 1. Aller dans le projet
cd project-pie

# 2. Récupérer les nouveaux fichiers
git pull origin rebase-dev

# 3. Installer CodeDeploy
bash scripts/setup-codedeploy.sh

# 4. Rendre les scripts exécutables
chmod +x scripts/codedeploy/*.sh
```

### 2.3 Configurer CloudWatch Logs

```bash
# Configurer les logs CloudWatch
bash scripts/setup-cloudwatch-logs.sh

# Configurer les logs locaux
bash scripts/setup-logs.sh
```

### 2.4 Vérifier l'installation

```bash
# Vérifier que l'agent CodeDeploy est actif
sudo systemctl status codedeploy-agent

# Vérifier que l'agent CloudWatch Logs est actif
sudo service awslogs status

# Devrait afficher "Active: active (running)" pour les deux
```

---

## 🏗️ ÉTAPE 3 : Configuration CodeDeploy (20 minutes)

### 3.1 Créer l'application CodeDeploy

**AWS Console → CodeDeploy → Applications → Créer une application**
- **Nom de l'application :** `project-pie`
- **Plateforme de calcul :** `EC2/On-premises`
- Cliquer sur **Créer une application**

### 3.2 Créer le groupe de déploiement

**Dans l'application CodeDeploy → Groupes de déploiement → Créer un groupe de déploiement**

**Configuration de base :**
- **Nom du groupe de déploiement :** `project-pie-production`
- **Rôle de service :** `CodeDeployServiceRole`

**Configuration du déploiement :**
- **Type de déploiement :** `In-place`

**Configuration de l'environnement :**
- **Instances Amazon EC2 :** Sélectionné
- **Key:** `Application` **Value:** `project-pie`
- Votre instance EC2 devrait apparaître dans la liste

**Agent AWS CodeDeploy :**
- **Installer l'agent CodeDeploy :** `Never`

**Configuration du Load Balancer :**
- **Activer l'équilibrage de charge :** Décoché

**Configuration avancée :**
- **Rollback automatique :** Activé
- **Rollback quand un déploiement échoue :** Activé
- **Rollback quand des seuils d'alarme sont atteints :** Activé

Cliquer sur **Créer un groupe de déploiement**

---

## 📋 ÉTAPE 4 : Configuration GitHub Actions (5 minutes)

### 4.1 Remplacer le workflow GitHub

**Sur votre WSL local :**
```bash
# Sauvegarder l'ancien workflow
mv .github/workflows/ci.yml .github/workflows/ci-old.yml

# Activer le workflow CodeDeploy
mv .github/workflows/ci-codedeploy.yml .github/workflows/ci.yml
```

### 4.2 Vérifier les secrets GitHub

**GitHub → Votre repository → Settings → Secrets and variables → Actions**

Vérifier que ces secrets existent :
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## 🧪 ÉTAPE 5 : Test du déploiement (15 minutes)

### 5.1 Test manuel dans AWS Console

**AWS Console → CodeDeploy → Applications → project-pie → Créer un déploiement**
- **Groupe de déploiement :** `project-pie-production`
- **Type de révision :** `My application is stored in GitHub`
- **Nom du référentiel :** `votre-username/project-pie`
- **ID de commit :** Le SHA du dernier commit sur `rebase-dev`

Cliquer sur **Créer un déploiement**

### 5.2 Suivre le déploiement

Dans AWS Console, vous verrez :
1. **En cours** : Le déploiement commence
2. **BeforeInstall** : Arrêt des services
3. **Install** : Copie des fichiers
4. **ApplicationStart** : Démarrage des services
5. **ValidateService** : Vérification
6. **Succeeded** : Succès !

### 5.3 Vérifier les logs sur EC2

**SSH vers votre EC2 :**
```bash
# Logs de l'agent CodeDeploy
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log

# Logs de nos scripts
tail -f /var/log/project-pie/codedeploy.log
```

---

## 🚀 ÉTAPE 6 : Test du déploiement automatique

### 6.1 Faire un changement test

**Sur votre WSL local :**
```bash
# Faire un petit changement
echo "# Test CodeDeploy $(date)" >> README.md

# Commiter et pousser
git add README.md
git commit -m "test: automatic CodeDeploy deployment"
git push origin feat/PROS-000-deployment-2
```

### 6.2 Créer et merger une PR

1. **Créer une PR** vers `rebase-dev`
2. **Merger la PR**
3. **Vérifier dans GitHub Actions** que le workflow se déclenche
4. **Vérifier dans AWS Console** que le déploiement se lance

---

## 📊 Surveillance et Maintenance

### Voir les déploiements

**AWS Console → CodeDeploy → Applications → project-pie → Historique des déploiements**

### Voir les logs dans CloudWatch

**AWS Console → CloudWatch → Logs :**
- **codedeploy-agent-logs** : Logs de l'agent CodeDeploy
- **codedeploy-deployment-logs** : Logs des déploiements CodeDeploy
- **project-pie-codedeploy-logs** : Logs de nos scripts CodeDeploy
- **project-pie-deployment-logs** : Logs de l'ancien script update-prod.sh

### Voir les logs en temps réel sur EC2

**SSH vers votre EC2 :**
```bash
# Script pour voir tous les logs
./view-logs.sh

# Logs en temps réel
tail -f /var/log/project-pie/codedeploy.log

# Logs CodeDeploy agent
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log
```

### Commandes utiles

```bash
# Redémarrer l'agent CodeDeploy
sudo systemctl restart codedeploy-agent

# Voir le statut
sudo systemctl status codedeploy-agent

# Voir les derniers déploiements
ls -la /opt/codedeploy-agent/deployment-root/
```

---

## 🎯 Résultat final

**Désormais, à chaque fois que vous :**
1. **Mergez une PR vers `rebase-dev`**
2. **GitHub Actions** se déclenche automatiquement
3. **AWS CodeDeploy** déploie votre code sur EC2
4. **Votre site est mis à jour** automatiquement
5. **Rollback automatique** si problème

**Fini les git pull manuels ! 🎉**

---

## 🔧 Dépannage

### Problème : L'agent CodeDeploy ne démarre pas
```bash
sudo systemctl restart codedeploy-agent
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log
```

### Problème : Déploiement échoue
```bash
# Vérifier les logs de nos scripts
tail -f /var/log/project-pie/codedeploy.log

# Vérifier les permissions
ls -la scripts/codedeploy/
chmod +x scripts/codedeploy/*.sh
```

### Problème : Instance EC2 non trouvée
- Vérifier que l'instance EC2 a les bons tags
- Vérifier que le rôle IAM est attaché à l'instance

---

## 💡 Conseil

**Gardez cet ordre pour le premier déploiement :**
1. Test manuel dans AWS Console d'abord
2. Une fois que ça marche, test via GitHub Actions
3. Puis utilisation normale

**Bonne chance ! 🚀** 