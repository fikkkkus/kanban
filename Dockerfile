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
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT
ARG VITE_REVERB_SCHEME
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN printf "VITE_REVERB_APP_KEY=%s\nVITE_REVERB_HOST=%s\nVITE_REVERB_PORT=%s\nVITE_REVERB_SCHEME=%s\n" \
    "${VITE_REVERB_APP_KEY}" "${VITE_REVERB_HOST}" "${VITE_REVERB_PORT}" "${VITE_REVERB_SCHEME}" > .env.production
RUN npm run build

# Runtime image
FROM php:8.4-fpm-alpine

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
    freetype-dev \
    linux-headers

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
        sockets \
        pcntl

WORKDIR /var/www/html

# Copy app sources
COPY --from=composer /app/vendor /var/www/html/vendor
COPY --from=node /app/public/build /var/www/html/public/build
COPY . /var/www/html

# Nginx + Supervisor config
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod +x /entrypoint.sh \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80 8080
ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
