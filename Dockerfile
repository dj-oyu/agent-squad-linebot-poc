# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /app

# 依存ファイルコピー
COPY backend/linebot/package.json backend/linebot/package-lock.json* ./backend/linebot/
COPY backend/agent-squad/package.json backend/agent-squad/package-lock.json* ./backend/agent-squad/

# 依存インストール
RUN cd backend/linebot && npm install
RUN cd backend/agent-squad && npm install

# ソースコードコピー
COPY backend ./backend

# Prismaクライアント生成
RUN cd backend/agent-squad && npx prisma generate --schema=../db/schema.prisma

# スタートアップスクリプトに実行権限を付与
RUN chmod +x backend/scripts/start-agent-squad.sh backend/scripts/start-linebot.sh

# デフォルトはlinebot起動（docker-composeでoverride可）
CMD ["backend/scripts/start-linebot.sh"]
