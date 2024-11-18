# Projet : Prospero

Ce projet combine **Symfony** pour la partie backend et **React** pour la partie frontend, le tout orchestré à l'aide de **Docker**.

## Prérequis

- **Docker** installés sur votre machine.
- **Makefile** installés sur votre machine.
- **Git** pour cloner le projet.
- **Make** pour cloner le projet.

## Installation

1. **Configurer les fichiers environnement** :
   - Copier les fichiers `.env` nécessaires :
     ```bash
     cp /.env.example /.env
     ```
   - Ajuster les variables dans ces fichiers en fonction de votre configuration.

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

      Windows : Double-cliquez sur le certificat racine (rootCA.pem), puis cliquez sur Installer le certificat et sélectionnez Autorités de certification racines de confiance.

4. **Accéder au projet** :
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