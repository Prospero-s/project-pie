# 🎯 Demo Account Fixtures - Architecture Refactorisée

## 🏗️ Architecture Modulaire

Le système de fixtures de démonstration a été refactorisé selon les **bonnes pratiques de clean code** :

### Structure des fichiers :
```
src/DataFixtures/Demo/
├── DemoFixturesLoader.php          # 🎯 Orchestrateur principal
├── User/
│   ├── DemoUserFixture.php         # 👤 Gestion utilisateur & groupe
│   └── demo-user.json              # 📄 Données utilisateur
├── Company/
│   ├── DemoCompanyFixture.php      # 🏢 Gestion entreprises
│   └── demo-companies.json         # 📄 Données entreprises françaises
├── Investment/
│   ├── DemoInvestmentFixture.php   # 💰 Gestion investissements
│   └── demo-investments.json       # 📄 Configuration investissements
└── Common/
    ├── DemoDataLoader.php          # 📥 Service de chargement JSON
    └── DemoCleanupService.php      # 🧹 Service de nettoyage
```

## 🚀 Comment lancer

```bash
# Charger uniquement les fixtures du compte démo
make load-demo-fixtures

# Tester le compte démo et afficher un résumé
make test-demo-account
```

## 📊 Ce que ça fait

### Données créées :
- **1 utilisateur démo** : `tifasek566@ethsms.com` (AWS Cognito)
- **12 entreprises françaises** avec vrais numéros SIREN/SIRET
- **~30M EUR** de portefeuille d'investissements
- **7 secteurs** d'activité : technology, healthcare, finance, retail, manufacturing, energy, education
- **Types de financement** : seed, serieA, serieB, serieC, growth, ipo

### Entreprises incluses :
- **Énergie** : TotalEnergies, Schneider Electric
- **Tech** : Orange, Dassault Systèmes, Capgemini
- **Santé** : L'Oréal, Sanofi
- **Retail** : LVMH
- **Manufacturing** : Airbus, Michelin, Safran
- **Finance** : Thales

## 🔧 Avantages de la refactorisation

### ✅ **Séparation des responsabilités**
- Chaque fixture a une responsabilité unique
- Code plus lisible et maintenable
- Tests unitaires plus faciles

### ✅ **Configuration externalisée**
- Données dans des fichiers JSON
- Modification sans toucher au code PHP
- Configuration centralisée des règles métier

### ✅ **Réutilisabilité**
- Services communs réutilisables
- Architecture extensible
- Ajout facile de nouvelles fixtures

### ✅ **Gestion d'erreurs robuste**
- Validation des fichiers JSON
- Messages d'erreur explicites
- Nettoyage automatique des données existantes

## 🔧 Fichiers techniques

### Fixtures PHP :
- `DemoFixturesLoader.php` - Point d'entrée principal
- `DemoUserFixture.php` - Création utilisateur/groupe/notifications
- `DemoCompanyFixture.php` - Création entreprises/adresses/représentants
- `DemoInvestmentFixture.php` - Création investissements avec logique métier

### Services :
- `DemoDataLoader.php` - Chargement et validation JSON
- `DemoCleanupService.php` - Nettoyage sécurisé des données

### Configuration JSON :
- `demo-user.json` - Utilisateur, groupe, paramètres notifications
- `demo-companies.json` - Entreprises françaises avec dirigeants réels
- `demo-investments.json` - Types de financement et montants par secteur

## ⚠️ Important

- **Nettoyage automatique** : Supprime et recrée les données à chaque exécution
- **Données réalistes** : Entreprises françaises avec vrais SIREN/SIRET
- **Compatible frontend** : Types de financement alignés avec les traductions
- **Montants fictifs** : Investissements générés aléatoirement pour la démo

## 🎯 Résumé affiché

```
==================================================
🎯 RÉSUMÉ DU COMPTE DE DÉMONSTRATION
==================================================
📊 Entreprises créées: 12
💰 Investissements créés: 24
💼 Valeur totale du portefeuille: 30.2M EUR
🏷️  Types de financement: seed, serieA, serieB, serieC, growth, ipo
==================================================
``` 