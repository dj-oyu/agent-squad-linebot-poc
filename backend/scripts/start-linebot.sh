#!/bin/sh
set -e

echo "Starting linebot service..."

# アプリケーション起動
echo "Starting application..."
cd /app/backend/linebot
npm run dev