# 🎯 Demo Account Fixtures

## Qu'est-ce que c'est ?

Système de fixtures pour créer un **compte de démonstration** avec des données réalistes d'entreprises françaises pour les présentations commerciales et les tests.

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
- **24 entreprises françaises** avec vrais numéros SIREN
- **48M EUR** de portefeuille d'investissements
- **11 secteurs** d'activité variés
- **Types de financement** : Private Equity, Series A/B/C, etc.

### Entreprises incluses :
- **Tech** : Criteo, BlaBlaCar, Doctolib, Mirakl
- **FinTech** : Lydia, Qonto, PayFit
- **E-commerce** : Veepee, ManoMano
- **Santé** : Sanofi, Biomerieux
- **Et plus...**

## 🔧 Fichiers techniques

- `src/DataFixtures/DemoAccountFixtures.php` - Fixtures Doctrine
- `scripts/test-demo-account.php` - Script de test et validation
- Commandes Makefile : `load-demo-fixtures`, `test-demo-account`

## ⚠️ Important

- Utilise le flag `--append` pour ne pas écraser les données existantes
- Données réalistes mais **fictives** pour les montants d'investissement
- Compatible avec le système de traductions FR/EN 