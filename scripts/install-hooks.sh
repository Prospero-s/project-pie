#!/bin/bash

# Copier les hooks dans le dossier .git/hooks
cp git-hooks/* .git/hooks/

# Rendre les hooks exécutables
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/pre-push

echo "Hooks Git installés avec succès"
