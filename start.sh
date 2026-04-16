#!/bin/sh
set -e

# Run database migrations
cd /app/api && npx prisma migrate deploy

# Template nginx config with Railway's PORT (default 8080)
export PORT="${PORT:-8080}"
envsubst '$PORT' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

# Start API on internal port 3000 (nginx proxies /trpc to it)
PORT=3000 node /app/api/dist/src/index.js &

# nginx in foreground as PID 1 (tini handles signals)
exec nginx -g 'daemon off;'
