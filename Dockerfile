# Build PHP dependencies
FROM composer:2 AS composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --no-scripts
COPY . .
RUN mkdir -p bootstrap/cache storage \
    && chmod -R 775 bootstrap/cache storage \
    && composer dump-autoload --optimize \
    && php artisan package:discover --ansi

# Build frontend assets
FROM node:20-alpine AS node
WORKDIR /app
RUN apk add --no-cache \
    php \
    php-cli \
    php-mbstring \
    php-openssl \
    php-pdo \
    php-sqlite3 \
    php-tokenizer \
    php-xml
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
COPY --from=composer /app/vendor /app/vendor
RUN mkdir -p storage bootstrap/cache \
    && touch storage/database.sqlite \
    && chmod -R 775 storage bootstrap/cache \
    && APP_KEY=$(php -r "echo 'base64:'.base64_encode(random_bytes(32));") \
    && printf "APP_NAME=Kanban\nAPP_ENV=production\nAPP_DEBUG=false\nAPP_URL=http://localhost\nAPP_KEY=%s\nDB_CONNECTION=sqlite\nDB_DATABASE=/app/storage/database.sqlite\n" "$APP_KEY" > .env
RUN npm run build

# Runtime image
FROM php:8.2-fpm-alpine

# System deps
RUN apk add --no-cache \
    bash \
    nginx \
    supervisor \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    zlib-dev \
    sqlite-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        bcmath \
        intl \
        mbstring \
        pdo \
        pdo_mysql \
        pdo_sqlite \
        zip \
        gd \
        sockets

WORKDIR /var/www/html

# Copy app sources
COPY --from=composer /app/vendor /var/www/html/vendor
COPY --from=node /app/public/build /var/www/html/public/build
COPY . /var/www/html

# Nginx + Supervisor config
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80 8080
ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
