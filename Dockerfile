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

# デフォルトはlinebot起動（docker-composeでoverride可）
CMD ["npm", "run", "dev", "--prefix", "backend/linebot"]
