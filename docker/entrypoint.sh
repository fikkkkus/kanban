#!/usr/bin/env sh
set -e

cd /var/www/html

# Ensure storage and cache directories exist and are writable
mkdir -p storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Ensure SQLite database file exists when using sqlite
if [ "${DB_CONNECTION}" = "sqlite" ]; then
  DB_FILE="${DB_DATABASE:-/var/www/html/storage/database.sqlite}"
  if [ ! -f "$DB_FILE" ]; then
    mkdir -p "$(dirname "$DB_FILE")"
    touch "$DB_FILE"
    chown www-data:www-data "$DB_FILE"
  fi
fi

# Optional migrations (set RUN_MIGRATIONS=true)
if [ "${RUN_MIGRATIONS}" = "true" ]; then
  php artisan migrate --force
fi

exec "$@"