# ── Stage 1: Build API ───────────────────────────────────────────────────────
FROM node:22-alpine AS api-build
WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci
COPY api/ ./
RUN npm run build

# ── Stage 2: Build web ───────────────────────────────────────────────────────
FROM node:22-alpine AS web-build
WORKDIR /app
# api source is needed to resolve TypeScript types (veed-api/src/appRouter path alias)
COPY api/ ./api/
COPY web/package*.json ./web/
RUN cd web && npm ci
COPY web/ ./web/
# Empty VITE_API_URL → tRPC links use relative URLs (/trpc), nginx handles routing
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN cd web && npm run build

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM node:22-alpine
RUN apk add --no-cache nginx openssl gettext tini

WORKDIR /app

# API — production deps (includes prisma for migrate deploy at startup)
COPY api/package*.json ./api/
RUN cd api && npm ci --omit=dev
COPY --from=api-build /app/api/dist ./api/dist
COPY api/prisma ./api/prisma
# Regenerate prisma client for linux-musl (alpine)
RUN cd api && npx prisma generate

# Web — static files only
COPY --from=web-build /app/web/dist ./web/dist

# nginx
COPY nginx.conf /etc/nginx/http.d/default.conf.template
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/start.sh"]
