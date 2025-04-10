# Extracteur de données financières pour Board Packs

Ce service permet d'extraire automatiquement des données financières clés à partir de Board Packs PDF en utilisant la reconnaissance optique de caractères (OCR) et l'intelligence artificielle.

## Fonctionnalités

- Conversion de PDF en images haute résolution
- Reconnaissance de texte avec Tesseract OCR
- Extraction de données financières via l'API OpenAI
- Stockage des résultats intermédiaires et finaux

## Configuration

### Prérequis

- Docker et Docker Compose
- Clé API OpenAI

### Variables d'environnement

- `OPENAI_API_KEY` : Votre clé API OpenAI

## Installation

1. Ajoutez votre clé API OpenAI dans le fichier `.env` à la racine du projet :

```
OPENAI_API_KEY=votre_clé_api_openai
```

2. Lancez les services avec Docker Compose :

```bash
docker-compose up -d
```

## Utilisation

### API REST

L'API expose les endpoints suivants :

- **GET /health** : Vérifier si le service est disponible
- **POST /upload** : Envoyer un fichier PDF pour extraction

#### Exemple d'utilisation avec curl

```bash
curl -X POST -F "file=@chemin/vers/votre/fichier.pdf" http://localhost:5000/upload
```

### Interface utilisateur

L'interface utilisateur est accessible à l'adresse suivante :

```
http://localhost:80/fr/financial-extraction
```

ou

```
http://localhost:80/en/financial-extraction
```

## Structure des données extraites

Le service retourne les données au format JSON avec la structure suivante :

```json
{
  "date": "Date du rapport",
  "revenus": "Montant des revenus",
  "dépenses": "Montant des dépenses",
  "bénéfice_net": "Montant du bénéfice net",
  "autres_indicateurs": {
    "indicateur1": "valeur1",
    "indicateur2": "valeur2"
  }
}
```

## Dépannage

- **Problèmes d'OCR** : Assurez-vous que le PDF est de bonne qualité. Augmentez la résolution (DPI) si nécessaire.
- **Erreurs d'extraction** : Vérifiez que le texte extrait contient bien les informations financières recherchées.
- **Problèmes de connexion** : Assurez-vous que les services Docker sont bien démarrés et que les ports sont accessibles. 