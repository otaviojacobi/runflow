#!/bin/bash

# This script runs Prisma migrations in production
# It's called by Vercel during the build process

set -e

echo "🔄 Running database migrations..."

# Run migrations
npx prisma migrate deploy

echo "✅ Migrations completed successfully!"
