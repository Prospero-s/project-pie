# Projet : Prospero

Ce projet combine **Symfony** pour la partie backend et **React** pour la partie frontend, le tout orchestré à l'aide de **Docker**.

## Prérequis

- **Docker** installés sur votre machine.
- **Makefile** installés sur votre machine.
- **Git** pour cloner le projet.
- **Make** pour cloner le projet.
- **Visual Studio Code** avec l'extension **Remote - WSL**.

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
   - Build l'image :
      ```bash
      make build
      ```
   
   - Monté les services :
      ```bash
      make up
      ```

3. **Installer les dépendances** :
   - Entrée dans le shell du conteneur PHP :
      ```bash
      make shell
      ```
      
   - Backend (Symfony) :
     ```bash
     composer install
     ```

   - Frontend (React) :
     ```bash
     npm install
     ```

4. **Installer les certificats** :
   - Installer mkcert :
      MacOS
      ```bash
     brew install mkcert
     brew install nss # if you use Firefox
     ```

     Linux
      ```bash
     sudo apt install libnss3-tools
         -or-
      sudo yum install nss-tools
         -or-
      sudo pacman -S nss
         -or-
      sudo zypper install mozilla-nss-tools
     ```

      Sur Windows, utiliser Chocolatey
      ```bash
      choco install mkcert
      ```

      Ou Scoop
      ```bash
      scoop bucket add extras
      scoop install mkcert
      ```

   - Générer et vérifier les certifications :
      ```bash
     mkcert -cert-file frankenphp/certs/tls.pem -key-file frankenphp/certs/tls.key "localhost"
     ```

   - Ajoutez le certificat racine de mkcert au système :
      ```bash
     mkcert -CAROOT
     ```

      Mac :
      ```bash
      sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$(mkcert -CAROOT)/rootCA.pem"
      ```
      
      Linux :
      ```bash
      sudo cp "$(mkcert -CAROOT)/rootCA.pem" /usr/local/share/ca-certificates/rootCA.crt
      sudo update-ca-certificates
      ```

   - Windows : Double-cliquez sur le certificat racine (rootCA.pem), puis cliquez sur Installer le certificat et sélectionnez     Autorités de certification racines de confiance.

   - Sinon, Windows : Étapes pour installer un certificat racine (.pem) sur Windows :
      Double-cliquez sur le fichier .pem : Lorsque vous double-cliquez sur un fichier .pem, il devrait vous demander quel programme l'ouvrir. Si vous ne voyez pas "Certificate Manager" ou "CertMgr.msc" dans la liste, vous pouvez essayer d'ouvrir le fichier directement avec Gestionnaire de certificats Windows.

      Si ce n'est pas le cas, vous pouvez également essayer de lancer le gestionnaire de certificats via la commande certmgr.msc.

      Lancer le gestionnaire de certificats Windows :

      Appuyez sur Win + R pour ouvrir la fenêtre "Exécuter".
      Tapez certmgr.msc et appuyez sur Entrée. Cela ouvrira le gestionnaire de certificats.
      Importer le certificat :

      Dans le gestionnaire de certificats, sous le menu à gauche, développez le dossier Autorités de certification racines de confiance.
      Cliquez avec le bouton droit sur Certificats sous Autorités de certification racines de confiance, puis sélectionnez Toutes les tâches > Importer...
      Sélectionnez le certificat à importer :

      La fenêtre "Assistant Importation de certificat" s'ouvrira.
      Cliquez sur Parcourir..., puis sélectionnez votre fichier .pem.
      Cliquez sur Suivant et choisissez Placer tous les certificats dans le magasin suivant.
      Sélectionnez Autorités de certification racines de confiance et cliquez sur Suivant.
      Cliquez sur Terminer pour importer le certificat.

5. **Configurer WSL avec Visual Studio Code** :

   - **Installer WSL** : Suivez les instructions officielles pour installer WSL sur votre machine Windows. Assurez-vous d'avoir une distribution Linux installée (comme Ubuntu a installer directement depuis le Microsoft Store).

   - **Installer Visual Studio Code** : Téléchargez et installez Visual Studio Code si ce n'est pas déjà fait.

   - **Installer l'extension Remote - WSL** : Ouvrez Visual Studio Code, allez dans l'onglet Extensions (ou utilisez le raccourci `Ctrl+Shift+X`), et recherchez "Remote - WSL". Installez l'extension.

   - **Ouvrir le projet dans WSL** : Après avoir installé l'extension, vous pouvez ouvrir le projet dans VS Code en utilisant le raccourci `Ctrl+Shift+P`, puis en tapant `Connect to WSL in New Window` et choisir la distribution Linux que vous avez installée.

   - **Copier le projet dans WSL** : Après avoir lancer le WSL sur VS Code, copiez le projet dans WSL soit via le terminal WSL soit via l'explorateur de fichier.

   - **Configurer les paramètres** : Assurez-vous que votre projet est configuré pour utiliser les chemins et les outils disponibles dans WSL. Vous pouvez ajuster les paramètres de votre projet dans Visual Studio Code pour s'assurer qu'il utilise les bons interpréteurs et outils. Il se peut qu'il y ait des problèmes sur l'installation des node_modules à cause des permissions. Si c'est le cas, copier les node_modules de votre pc hors WSL et les coller dans le projet dans WSL. Ajouter une permission pour que le container puisse lire le dossier node_modules.
      ```bash
      sudo chmod -R 777 node_modules
      ```	
   - **Lancer le projet** :
      ```bash
      docker-compose up -d
      ```

6. **Accéder au projet** :
   - http://localhost

## Structure du Projet

```
.
├── .env                    # Fichier de configuration
├── Dockerfile              # Dockerfile pour le projet
├── certs/                  # Les certificats HTTPS
├── src/                    # Code Symfony
│   ├── Controller/         # Code Controller Symfony
│   ├── Entity                # Fichier de configuration
│   └── Dockerfile          # Dockerfile pour PHP
├── Assets/                 # Code React
│   ├── src/                # Code source frontend
│   ├── .env                # Fichier de configuration
│   └── Dockerfile          # Dockerfile pour Node.js
├── docker-compose.yml      # Configuration Docker Compose
└── README.md               # Ce fichier
```

## Licence

Ce projet est sous licence [MIT](LICENSE).