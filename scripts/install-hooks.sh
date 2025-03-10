#!/usr/bin/env bash

# Vérifier que le script est exécuté depuis la racine du projet
if [ ! -d "git-hooks" ]; then
    echo "❌ Le script doit être exécuté depuis la racine du projet."
    echo "Exemple: bash scripts/install-hooks.sh"
    exit 1
fi

# Vérifier que git est initialisé
if [ ! -d ".git" ]; then
    echo "❌ Aucun dépôt git n'a été trouvé (.git)."
    echo "Initialisez git d'abord: git init"
    exit 1
fi

# Créer le répertoire des hooks git s'il n'existe pas
mkdir -p .git/hooks

# Vérifier l'existence des hooks avant installation
for hook in "pre-commit" "pre-push" "commit-msg"; do
    if [ ! -f "git-hooks/$hook" ]; then
        echo "❌ Le hook $hook n'existe pas dans le répertoire git-hooks."
        exit 1
    fi
done

# Installer les hooks avec gestion d'erreur
install_hook() {
    local hook_name=$1
    echo "Installation du hook: $hook_name"
    
    if cp "git-hooks/$hook_name" ".git/hooks/$hook_name"; then
        chmod +x ".git/hooks/$hook_name"
        echo "✓ $hook_name installé"
    else
        echo "❌ Échec de l'installation de $hook_name"
        exit 1
    fi
}

# Installer chaque hook
install_hook "pre-commit"
install_hook "pre-push"
install_hook "commit-msg"

echo "--------------------------------"
echo "✅ Git hooks installés avec succès!"
echo "--------------------------------"
