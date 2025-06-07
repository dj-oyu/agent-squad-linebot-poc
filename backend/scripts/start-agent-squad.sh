#!/bin/sh
set -e

echo "Starting agent-squad service..."

# Prismaマイグレーション実行
echo "Running Prisma migrations..."
cd /app/backend/agent-squad
npx prisma migrate deploy --schema=../db/schema.prisma

# アプリケーション起動
echo "Starting application..."
npm run dev