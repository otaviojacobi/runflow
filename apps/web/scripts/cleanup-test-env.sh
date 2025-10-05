#!/bin/bash
set -e

echo "🧹 Cleaning up test environment..."

# Navigate to root directory
cd "$(dirname "$0")/../../.."

# Stop docker compose services
echo "🛑 Stopping docker compose services..."
docker compose down -v

echo "✅ Test environment cleanup complete!"
