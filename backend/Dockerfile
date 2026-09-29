# =========================
# Build Stage
# =========================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Prisma et argon2 disposent de binaires précompilés compatibles avec Debian.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build


# =========================
# Production Stage
# =========================
FROM node:20-bookworm-slim

WORKDIR /app

# Prisma nécessite OpenSSL au runtime également.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/bootstrap.cjs ./bootstrap.cjs

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy templates
COPY --from=builder /app/src/templates ./src/templates

# Create non-root user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --create-home --shell /usr/sbin/nologin nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["sh", "-c", "npx prisma migrate deploy && node bootstrap.cjs"]
