# syntax=docker/dockerfile:1

# Base FrankenPHP image
FROM dunglas/frankenphp:1-php8.3 AS frankenphp_base

WORKDIR /app

VOLUME /app/var/

# Installation des dépendances système
# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    acl \
    file \
    gettext \
    git \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Installation des extensions PHP
RUN install-php-extensions \
    @composer \
    apcu \
    intl \
    opcache \
    zip \
    pdo \
    pdo_pgsql \
    pgsql

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV PHP_INI_SCAN_DIR=":$PHP_INI_DIR/app.conf.d"

# Dev FrankenPHP image
FROM frankenphp_base AS frankenphp_dev

ENV APP_ENV=dev XDEBUG_MODE=off

RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

COPY frankenphp/conf.d/20-app.dev.ini $PHP_INI_DIR/app.conf.d/
COPY frankenphp/Caddyfile /etc/caddy/Caddyfile
COPY frankenphp/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

ENTRYPOINT ["docker-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile", "--watch"]

# Prod FrankenPHP image
FROM frankenphp_base AS frankenphp_prod

ENV APP_ENV=prod

# Installation de Node.js avec une version LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g npm@latest

# Configuration de Caddy et PHP d'abord
COPY frankenphp/conf.d/20-app.prod.ini $PHP_INI_DIR/app.conf.d/
COPY frankenphp/Caddyfile /etc/caddy/Caddyfile
COPY frankenphp/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

# Copier les fichiers essentiels d'abord
COPY composer.json composer.lock symfony.lock package.json package-lock.json ./
COPY .env ./
COPY bin/console ./bin/console
RUN chmod +x bin/console

# Installer les dépendances sans les scripts post-install
RUN set -eux; \
    composer install --no-dev --optimize-autoloader --no-scripts; \
    composer clear-cache

# Installer les dépendances Node.js (incluant les dépendances de développement nécessaires pour le build)
RUN npm ci

# Copier le reste des fichiers
COPY . .

# Optimisations pour la production
RUN set -eux; \
    composer install --no-dev --optimize-autoloader; \
    composer dump-env prod; \
    composer dump-autoload --optimize --no-dev --classmap-authoritative; \
    php bin/console cache:clear --no-warmup; \
    php bin/console cache:warmup; \
    chmod -R 777 var

# Build des assets
RUN npm run build && \
    npm cache clean --force && \
    npm prune --production

# Configuration finale PHP
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

ENTRYPOINT ["docker-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"] 