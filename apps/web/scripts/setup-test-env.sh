#!/bin/bash
set -e

echo "🧪 Setting up test environment..."

# Navigate to root directory
cd "$(dirname "$0")/../../.."

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker compose down -v 2>/dev/null || true

# Start services with docker compose (without --wait, we'll wait manually)
echo "🚀 Starting services with docker compose..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."

# Wait for PostgreSQL to be ready
echo "  Waiting for PostgreSQL..."
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "  ✅ PostgreSQL is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "  ❌ PostgreSQL failed to start"
    exit 1
  fi
  sleep 2
done

# Wait for GoTrue (Auth) to be ready (needs more time for migrations)
echo "  Waiting for GoTrue (Auth)..."
for i in {1..60}; do
  if curl -sf http://localhost:9999/health > /dev/null 2>&1; then
    echo "  ✅ GoTrue is ready!"
    break
  fi
  if [ $i -eq 60 ]; then
    echo "  ❌ GoTrue failed to start"
    echo "  Check logs with: docker logs runflow_gotrue"
    exit 1
  fi
  sleep 2
done

# Wait for Kong to be ready
echo "  Waiting for Kong gateway..."
for i in {1..30}; do
  if curl -sf http://localhost:8000/auth/v1/health > /dev/null 2>&1; then
    echo "  ✅ Kong is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "  ❌ Kong failed to start"
    exit 1
  fi
  sleep 2
done

# Navigate to web app directory
cd apps/web

# Run Prisma migrations
echo "🗄️  Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Test environment setup complete!"
echo "📍 Services available at:"
echo "   - PostgreSQL: localhost:54322"
echo "   - Auth (GoTrue): localhost:9999"
echo "   - API Gateway (Kong): localhost:8000"
echo "   - Inbucket (Email): localhost:9000"
