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

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY . .
COPY frankenphp/conf.d/20-app.prod.ini $PHP_INI_DIR/app.conf.d/
COPY frankenphp/Caddyfile /etc/caddy/Caddyfile
COPY frankenphp/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

RUN set -eux; \
    mkdir -p var/cache var/log; \
    composer install --prefer-dist --no-dev --no-scripts --no-progress; \
    composer dump-autoload --classmap-authoritative --no-dev; \
    composer dump-env prod; \
    chmod +x bin/console; sync

ENTRYPOINT ["docker-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"] 