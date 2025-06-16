# Variables
DOCKER_COMPOSE = docker-compose
SYMFONY = docker-compose exec php bin/console
COMPOSER = docker-compose exec php composer
NPM = docker-compose exec node npm
PHP_CONTAINER = php
PHPUNIT = docker-compose exec $(PHP_CONTAINER) ./vendor/bin/phpunit

# Inclure les variables d'environnement
include .env
export

# Aide
.PHONY: help
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  up                - Lancer les conteneurs en arrière-plan"
	@echo "  down              - Arrêter les conteneurs"
	@echo "  restart           - Redémarrer les conteneurs"
	@echo "  build             - Construire les conteneurs Docker"
	@echo "  logs              - Afficher les logs des conteneurs"
	@echo "  shell             - Ouvrir un shell dans le conteneur PHP"
	@echo "  install           - Installer les dépendances avec Composer"
	@echo "  cache-clear       - Vider le cache Symfony"
	@echo ""
	@echo "Tests et Qualité de code:"
	@echo "  test              - Exécuter les tests PHPUnit"
	@echo "  run-tests         - Lance tous les tests et vérifications de qualité de code"
	@echo "  lint              - Lance ESLint"
	@echo "  lint-fix          - Corrige automatiquement les erreurs ESLint"
	@echo "  lint-phpcs        - Lance PHP Code Sniffer"
	@echo "  lint-phpcs-fix    - Corrige automatiquement les erreurs PHP Code Sniffer"
	@echo "  phpstan           - Lance PHPStan"
	@echo "  test     		   - Exécuter les tests PHPUnit avec testdox et couverture de code"
	@echo ""
	@echo "Base de données:"
	@echo "  migrations        - Exécuter les migrations de base de données"
	@echo "  test-db-local     - Vérifier la connexion à la base de données locale"
	@echo "  test-db-aws       - Vérifier la connexion à la base de données AWS"
	@echo "  test-all-db       - Vérifier les deux bases de données"
	@echo "  migrations-local  - Exécuter les migrations en local"
	@echo "  migrations-status-local - Statut des migrations en local"
	@echo "  migrations-rollback-local - Annuler la dernière migration en local"
	@echo ""
	@echo "Fixtures et données:"
	@echo "  load-dev-fixtures - Charger les fixtures de développement"
	@echo "  load-demo-fixtures - Charger les fixtures de démonstration"
	@echo "  test-demo-account - Tester le compte de démonstration"
	@echo ""
	@echo "Autres:"
	@echo "  hooks             - Installer les hooks Git"
	@echo "  logs-php          - Afficher les logs PHP"

# Cibles

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

delete containers:
	$(DOCKER_COMPOSE) down --volumes

restart: down up

build:
	$(DOCKER_COMPOSE) build

logs:
	$(DOCKER_COMPOSE) logs -f

shell:
	$(DOCKER_COMPOSE) exec $(PHP_CONTAINER) /bin/bash

install:
	$(COMPOSER) install

cache-clear:
	$(SYMFONY) cache:clear

test:
	$(PHPUNIT) --testdox --coverage-text

test-db-local:
	$(SYMFONY) doctrine:schema:validate
	$(SYMFONY) doctrine:migrations:status

test-db-aws:
	DATABASE_URL="$$DATABASE_URL_AWS" $(SYMFONY) doctrine:schema:validate
	DATABASE_URL="$$DATABASE_URL_AWS" $(SYMFONY) doctrine:migrations:status

test-all-db: test-db-local test-db-aws

# Commandes pour installer les hooks
hooks:
	chmod +x ./scripts/install-hooks.sh
	./scripts/install-hooks.sh

# Commandes pour les migrations

load-dev-fixtures:
	$(SYMFONY) doctrine:f:load -n

load-demo-fixtures:
	$(SYMFONY) doctrine:fixtures:load --group=demo --append --no-interaction

test-demo-account:
	$(DOCKER_COMPOSE) exec php php scripts/test-demo-account.php

migrations-diff:
	$(SYMFONY) doctrine:migrations:diff --formatted
	sed -i '/CREATE SCHEMA public/d' migrations/Version*.php

migrations-local:
	$(SYMFONY) doctrine:migrations:migrate --no-interaction --env=dev

migrations-status-local:
	$(SYMFONY) doctrine:migrations:status --env=dev

migrations-test-aws:
	$(eval DATABASE_URL=$(DATABASE_URL_AWS))
	$(DOCKER_COMPOSE) exec -e DATABASE_URL=$(DATABASE_URL) php bin/console doctrine:migrations:migrate --no-interaction --env=prod

migrations-status-test-aws:
	$(eval DATABASE_URL=$(DATABASE_URL_AWS))
	$(DOCKER_COMPOSE) exec -e DATABASE_URL=$(DATABASE_URL) php bin/console doctrine:migrations:status --env=prod --verbose

migrations-rollback-local:
	$(SYMFONY) doctrine:migrations:migrate prev --env=dev

migrations-rollback-test-aws:
	$(eval DATABASE_URL=$(DATABASE_URL_AWS))
	$(DOCKER_COMPOSE) exec -e DATABASE_URL=$(DATABASE_URL) php bin/console doctrine:migrations:migrate prev --env=prod

logs-php:
	$(DOCKER_COMPOSE) exec $(PHP_CONTAINER) tail -f var/log/dev.log

# Commandes de qualité de code
.PHONY: lint
lint: ## Lance ESLint
	$(DOCKER_COMPOSE) exec $(PHP_CONTAINER) npm run lint

.PHONY: lint-fix
lint-fix: ## Corrige automatiquement les erreurs ESLint
	$(DOCKER_COMPOSE) exec $(PHP_CONTAINER)  npm run lint-fix

.PHONY: lint-phpcs
lint-phpcs: ## Lance PHP Code Sniffer
	$(COMPOSER) cs-check

.PHONY: lint-phpcs-fix
lint-phpcs-fix: ## Corrige automatiquement les erreurs PHP Code Sniffer
	$(COMPOSER) cs-fix

.PHONY: phpstan
phpstan: ## Lance PHPStan
	$(COMPOSER) phpstan

.PHONY: run-tests
run-tests: ## Lance tous les tests et vérifications de qualité de code
	@echo "🔍 Lancement des vérifications de qualité de code..."
	$(COMPOSER) cs-fix
	$(COMPOSER) cs-check
	$(COMPOSER) phpstan
	@echo "🧪 Lancement des tests unitaires..."
	$(DOCKER_COMPOSE) exec $(PHP_CONTAINER) ./vendor/bin/phpunit
	@echo "📦 Build du frontend..."
	$(NPM) run build
	@echo "✅ Tous les tests et vérifications sont terminés !"
test:
	$(PHPUNIT) --testdox --coverage-text
