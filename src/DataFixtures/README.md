# Guide de Gestion des Données (Fixtures)

Ce guide explique comment gérer les données de test (fixtures) dans le projet, notamment comment ajouter, modifier ou charger de nouvelles données dans la base de données.

## Structure des Fichiers

```
src/DataFixtures/
├── data/                    # Dossier contenant les fichiers JSON de données
│   └── fixtures.json        # Données des entreprises
├── EnterpriseFixtures.php   # Classe de chargement des données d'entreprises
└── AppFixtures.php          # Classe de base pour les fixtures
```

## Ajouter de Nouvelles Données

### 1. Via Fichier JSON

Pour ajouter de nouvelles données via JSON :

1. **Créer/Modifier le fichier JSON** :
   - Placez votre fichier JSON dans le dossier `src/DataFixtures/data/`
   - Suivez la structure existante du fichier `fixtures.json`
   - Exemple de structure pour une entreprise :
   ```json
   {
       "enterprises": [
           {
               "denomination": "Nom Entreprise SA",
               "remote_society": false,
               "established_in_france": true,
               "legal_form": "SA",
               "main_activity": "Activité principale",
               "name": "Nom Court",
               "siret": "12345678900001",
               "siren": "123456789",
               "code_naf": "1234Z",
               "activities": "Description des activités",
               "capital": 1000000,
               "min_capital": 1000,
               "currency": "EUR",
               "address": {
                   "head_office": true,
                   "country": "France",
                   "postal_code": 75000,
                   "city": "Paris",
                   "track_type": "rue",
                   "route": "du Test",
                   "lane_number": "1"
               },
               "recipient": {
                   "firstname": "Prénom",
                   "lastname": "Nom",
                   "parts": 100
               }
           }
       ]
   }
   ```

2. **Lier le JSON au Fixture** :
   - Ouvrez `EnterpriseFixtures.php`
   - Modifiez la constante `JSON_FILE_PATH` si vous utilisez un nouveau fichier
   ```php
   private const JSON_FILE_PATH = __DIR__ . '/data/fixtures.json';
   ```

### 2. Via Classe PHP

Pour ajouter des données programmatiquement :

1. **Créer une nouvelle classe Fixture** :
   ```php
   namespace App\DataFixtures;

   use Doctrine\Bundle\FixturesBundle\Fixture;
   use Doctrine\Persistence\ObjectManager;
   use App\Entity\VotreEntite;

   class VotreFixture extends Fixture
   {
       public function load(ObjectManager $manager)
       {
           $entite = new VotreEntite();
           // Configurer l'entité
           $manager->persist($entite);
           $manager->flush();
       }
   }
   ```

## Charger les Données en Base

### 1. Charger toutes les fixtures :
```bash
# Dans le conteneur PHP
php bin/console doctrine:fixtures:load
```

### 2. Charger une fixture spécifique :
```bash
php bin/console doctrine:fixtures:load --group=enterprise
```

### 3. Ajouter sans purger la base :
```bash
php bin/console doctrine:fixtures:load --append
```

## Vérifier les Données

### 1. Via la Console Symfony :
```bash
# Lister toutes les entreprises
php bin/console doctrine:query:sql "SELECT * FROM enterprise"
```

### 2. Via l'API :
- Accédez à l'endpoint `/api/enterprises` pour voir toutes les entreprises
- Accédez à `/api/enterprises/{id}` pour voir une entreprise spécifique

### 3. Via le Profiler Symfony :
1. Accédez à votre application en mode dev
2. Cliquez sur la barre de debug Symfony
3. Allez dans l'onglet "Doctrine" pour voir les requêtes et les données

## Bonnes Pratiques

1. **Toujours versionner** les fichiers JSON de données
2. **Valider** la structure JSON avant le chargement
3. **Tester** le chargement des données dans un environnement de dev
4. **Documenter** les modifications importantes dans les données
5. **Backup** la base de données avant de charger de nouvelles données en production 