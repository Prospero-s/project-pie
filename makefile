# Variables
DOCKER_COMPOSE = docker-compose
SYMFONY = docker-compose exec php bin/console
COMPOSER = docker-compose exec php composer
NPM = docker-compose exec node npm
PHP_CONTAINER = php

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
	@echo "  migrations        - Exécuter les migrations de base de données"
	@echo "  test              - Exécuter les tests PHPUnit"
	@echo "  test-db-local     - Vérifier la connexion à la base de données locale"
	@echo "  test-db-aws       - Vérifier la connexion à la base de données AWS"
	@echo "  test-all-db       - Vérifier les deux bases de données"

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

migrations:
	$(SYMFONY) doctrine:migrations:migrate --no-interaction

test:
	$(DOCKER_COMPOSE) exec $(PHP_CONTAINER) ./vendor/bin/phpunit

test-db-local:
	$(SYMFONY) doctrine:schema:validate
	$(SYMFONY) doctrine:migrations:status

test-db-aws:
	DATABASE_URL="$$DATABASE_URL_AWS" $(SYMFONY) doctrine:schema:validate
	DATABASE_URL="$$DATABASE_URL_AWS" $(SYMFONY) doctrine:migrations:status

test-all-db: test-db-local test-db-aws

# Commandes pour les migrations
migrations-diff:
	$(SYMFONY) doctrine:migrations:diff

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