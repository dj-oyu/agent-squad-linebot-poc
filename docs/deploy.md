# デプロイ構成・手順

---

## 1. ローカルPoC（Docker Compose）

### 構成
- linebot（Express/TypeScript, @line/bot-sdk）
- agent-squad（MCPサーバー/TypeScript）
- db（Prisma ORM + SQLite）

### 手順
1. `.env.example`をコピーして`.env`を作成し、APIキー等を設定
2. Docker Desktopを起動
3. `docker-compose up --build`
4. ngrok等でWebhookをLINEに公開し、LINEチャネル設定
5. LINEで資料URLを送信→クイズ出題・回答

---

## 2. AWS本番移行（ECS Fargate/App Runner/Lambda）

### 構成
- linebot/agent-squadをDockerイメージ化し、ECRにpush
- ECS Fargate/App Runnerでサービス稼働 or Lambda（Node.js 20.x）でサーバレス化
- DBはDynamoDB/RDS等に切替
- S3で資料ファイル管理も拡張可能
- Secrets Manager/SSMでAPIキー・エンドポイント管理
- CloudWatchでログ・監査

### 手順（例: ECS Fargate）
1. `docker build`でイメージ作成→ECRにpush
2. ECS Fargateでサービス作成（ALB, VPC, IAM等はCDKでIaC管理推奨）
3. 環境変数・APIキーはSecrets Manager/SSMで安全に注入
4. DBマイグレーション（Prisma migrate等）
5. Route53/ALBでWebhookエンドポイント公開
6. CloudWatchでログ・監査

---

## 3. CI/CD（GitHub Actions）

- PR時にlint/test/ビルド/カバレッジ
- mainブランチマージ時にECR push→ECS/Lambda自動デプロイも拡張可能
- .env.example/.github/workflows/ci.ymlを常に最新に保つ

---

## 4. 環境変数・セキュリティ管理

- APIキー・エンドポイントは.env（ローカル）/Secrets Manager/SSM（本番）で厳格管理
- Webhook署名検証・ファイルサイズ制限・認可を徹底
- DB/ストレージ/CI/CDは本番用に切替

---

## 5. 今後の拡張

- IaC（AWS CDK/terraform）でインフラ自動化
- 管理画面・API利用状況可視化
- S3/CloudFrontで静的ファイル配信
- Blue/Greenデプロイ・自動ロールバック
