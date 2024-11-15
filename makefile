# Variables
DOCKER_COMPOSE = docker-compose
SYMFONY = docker-compose exec php bin/console
COMPOSER = docker-compose exec php composer
NPM = docker-compose exec node npm
PHP_CONTAINER = php # Nom du conteneur PHP dans docker-compose.yml

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

# Cibles

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

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
