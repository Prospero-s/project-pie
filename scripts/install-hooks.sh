#!/bin/bash

# Create git hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
cp git-hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Install pre-push hook
cp git-hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push

# Install commit-msg hook
cp git-hooks/commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg

echo "--------------------------------"
echo "✅ Git hooks installés avec succès!"
echo "--------------------------------"
