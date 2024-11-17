# Projet : Prospero

Ce projet combine **Symfony** pour la partie backend et **React** pour la partie frontend, le tout orchestré à l'aide de **Docker**.

## Prérequis

- **Docker** installés sur votre machine.
- **Makefile** installés sur votre machine.
- **Git** pour cloner le projet.

## Installation

1. **Configurer les fichiers environnement** :
   - Copier les fichiers `.env` nécessaires :
     ```bash
     cp /.env.example /.env
     ```
   - Ajuster les variables dans ces fichiers en fonction de votre configuration.
   - Pour la connexion à Supabase completer les deux variables suivantes :
      ```
      SUPABASE_DB_USER=******
      SUPABASE_DB_PASSWORD=******
      DATABASE_URL=pgsql://${SUPABASE_DB_USER}:${SUPABASE_DB_PASSWORD}@aws-0-eu-west-3.pooler.supabase.com:6543/prospero
      ```

2. **Lancer les conteneurs Docker** :
   ```bash
   make up
   ```

3. **Installer les dépendances** :
   - Backend (Symfony) :
     ```bash
     composer install
     ```
   - Frontend (React) :
     ```bash
     npm install
     ```

4. **Accéder au projet** :
   - http://localhost:8000

## Structure du Projet

```
.
├── backend/                # Code Symfony
│   ├── src/                # Code source backend
│   ├── .env                # Fichier de configuration
│   └── Dockerfile          # Dockerfile pour PHP
├── frontend/               # Code React
│   ├── src/                # Code source frontend
│   ├── .env                # Fichier de configuration
│   └── Dockerfile          # Dockerfile pour Node.js
├── docker-compose.yml      # Configuration Docker Compose
└── README.md               # Ce fichier
```

## Licence

Ce projet est sous licence [MIT](LICENSE).