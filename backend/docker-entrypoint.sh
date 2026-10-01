#!/bin/sh
set -e

echo "Migrations Prisma..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Seed..."
  node dist/seed.js
fi

exec "$@"