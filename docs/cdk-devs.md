# CDK開発向けメモ

AWS CDK で本リポジトリをデプロイする際の環境変数や構成上の注意点をまとめます。

---

## 必要な環境変数

`.env.example` にある下記の値を Secrets Manager / SSM から注入します。

```bash
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
GROK_API_KEY=your_grok_api_key
GROQ_API_KEY=your_groq_api_key
AGENT_SQUAD_API_URL=http://agent-squad:8000
ADMIN_LINE_USER_ID=admin-user
DATABASE_URL=file:./db/dev.db
```

その他、CDK 実行用に `AWS_ACCESS_KEY_ID` と `AWS_SECRET_ACCESS_KEY`、`AWS_REGION` などをローカル環境に設定しておきます。

---

## CDK での動的設定例

- **AGENT_SQUAD_API_URL**
  - agent-squad サービスを private subnet で起動し、Service Discovery (Cloud Map) を有効にします。
  - linebot コンテナには `http://agent-squad.<namespace>:8000` のように内部 DNS 名を設定します。
- **DATABASE_URL**
  - RDS などを CDK で作成し、接続文字列を Fargate タスク定義に渡します。

上記の値は `container.addEnvironment` もしくは `container.addSecret` でタスクへ注入します。ハードコードは避け、スタック側で決定した値を使います。

---

## 参考

- `docs/deploy.md` に ECS Fargate へのデプロイ手順があります。
- `docs/tech-stack.md` で採用技術をまとめています。
