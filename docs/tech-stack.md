# 技術構成・依存ライブラリ一覧

---

## 1. 言語・フレームワーク

- TypeScript（全体統一）
- Node.js 20.x
- Express.js（Webhook/APIサーバー）
- @line/bot-sdk（LINE Bot公式SDK）
- agent squad（MCPサーバー TypeScript拡張）

---

## 2. AI API用途分担

| 用途                     | 利用AI                | ライブラリ/SDK例           |
|--------------------------|-----------------------|----------------------------|
| コード生成               | OpenAI GPT-4.1        | openai                     |
| ドキュメント要約         | Gemini Pro 2.5        | google/generative-ai REST  |
| クイズ自動生成           | Gemini Pro 2.5        | google/generative-ai REST  |
| クイズ判定・講評         | Groq (Llama3 Scout)   | groq-sdk, fetch            |
| その他汎用応答           | Grok                  | grok-sdk, fetch            |

---

## 3. データベース・ストレージ

- Prisma ORM + SQLite（PoC）
- DynamoDB/RDS（本番移行時）
- S3（資料ファイル拡張時）

---

## 4. テスト・CI/CD

- Vitest / Jest（ユニット・統合テスト）
- GitHub Actions（CI/CD, lint, test, build, coverage）

---

## 5. インフラ・デプロイ

- Docker, Docker Compose（ローカル開発）
- AWS ECS Fargate / App Runner / Lambda（本番）
- AWS CDK（TypeScript, IaC）

---

## 6. 主要npm依存パッケージ

- express
- @line/bot-sdk
- agent-squad
- openai
- prisma
- sqlite3
- vitest / jest
- ts-node
- typescript
- dotenv
- cross-env
- aws-sdk
- googleapis / fetch
- groq-sdk / grok-sdk

---

## 7. その他

- .envでAPIキー・エンドポイント管理
- .clinerulesでToDo/設計指針を常時最新化
- ドキュメント・テスト・CI/CDの継続的最新化
