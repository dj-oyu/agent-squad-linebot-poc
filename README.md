# LINE × agent squad クイズ自動生成チャットボット PoC

## 概要

- LINE公式アカウントと連携し、ユーザーが送信した資料（URL等）をもとにAIがクイズを自動生成・出題するチャットボットのPoC
- agent squadフレームワークを活用し、用途ごとにOpenAI/Gemini/Grok/Groq(Llama3)を使い分けてコスト最適化
- TypeScript統一、Docker Composeでローカル開発、本番はAWS（ECS Fargate/App Runner/Lambda）を想定

---

## 技術スタック

- Node.js (TypeScript)
- Express.js（Webhook/APIサーバー）
- @line/bot-sdk
- agent squad（MCPサーバー TypeScript拡張）
- OpenAI, Gemini, Grok, Groq(Llama3) API
- Prisma ORM + SQLite（PoC）/ DynamoDB（本番）
- Docker, Docker Compose
- Vitest/Jest（テスト）
- GitHub Actions（CI/CD）
- AWS CDK（TypeScript）

---

## ディレクトリ構成

```
/docs                # 要件・設計・技術資料
/cdk                 # AWS CDK stacks
/backend
  /agent-squad       # agent squad MCPサーバー
  /linebot           # LINE Bot Webhook/API
  /db                # Prisma/SQLite
  /tests             # テスト
  Dockerfile
  docker-compose.yml
  .env.example
  README.md
/.github/workflows/ci.yml
.gitignore
.clinerules
```

---

## ローカル開発手順

1. 必要なAPIキーを`.env`または`.env.example`をコピーして設定
2. Docker Desktopを起動
3. `docker-compose up --build`
4. ngrok等でWebhookをLINEに公開し、LINEチャネル設定
5. LINEで資料URLを送信→クイズ出題・回答

---

## .env.example 設定例

```
LINE_CHANNEL_SECRET=xxxx
LINE_CHANNEL_ACCESS_TOKEN=xxxx
OPENAI_API_KEY=xxxx
GEMINI_API_KEY=xxxx
GROK_API_KEY=xxxx
GROQ_API_KEY=xxxx
AGENT_SQUAD_API_URL=http://agent-squad:8000
DATABASE_URL=file:./db/dev.db
```

---

## テスト

```sh
pnpm run test
```

---

## CI/CD・AWS移行

- GitHub ActionsでPR時にlint/test/ビルド/カバレッジ
- 本番はECR→ECS Fargate/App Runner or Lambda（Node.js 20.x）へデプロイ
- IaCはAWS CDK（TypeScript）で管理

---

## ライセンス

MIT
