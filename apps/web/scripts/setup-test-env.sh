#!/bin/bash
set -e

echo "🧪 Setting up test environment..."

# Navigate to root directory
cd "$(dirname "$0")/../../.."

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker compose down -v 2>/dev/null || true

# Start services with docker compose
echo "🚀 Starting services with docker compose..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  echo "Waiting for PostgreSQL... ($i/30)"
  sleep 2
done

# Wait for GoTrue (Auth) to be ready
echo "⏳ Waiting for GoTrue (Auth) to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:9999/health > /dev/null 2>&1; then
    echo "✅ GoTrue is ready!"
    break
  fi
  echo "Waiting for GoTrue... ($i/30)"
  sleep 2
done

# Wait for Kong to be ready
echo "⏳ Waiting for Kong gateway to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:8000/auth/v1/health > /dev/null 2>&1; then
    echo "✅ Kong is ready!"
    break
  fi
  echo "Waiting for Kong... ($i/30)"
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
