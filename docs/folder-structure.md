# フォルダ・ファイル構成と役割

```
/docs
  ├─ prd.md                # 要件定義書
  ├─ tech-stack.md         # 技術構成・依存ライブラリ
  ├─ architecture.mmd      # アーキテクチャ設計図（Mermaid）
  ├─ folder-structure.md   # 本ファイル（構成・役割まとめ）
  ├─ deploy.md             # デプロイ手順・AWS移行ポイント
/cdk                     # AWS CDK stacks
/backend
  /agent-squad             # agent squad MCPサーバー（AI用途分担・拡張）
    ├─ mcp-server.ts
    ├─ tools/              # 各AI APIラッパー・用途分岐
    └─ tests/
  /linebot                 # LINE Bot Webhook/API
    ├─ webhook.ts
    ├─ services/
    ├─ utils/
    └─ tests/
  /db                      # Prisma ORM/SQLiteスキーマ
    ├─ schema.prisma
    └─ seed.ts
  /tests                   # 共通テスト
  Dockerfile               # サービス共通Dockerfile
  docker-compose.yml       # ローカル開発用Compose
  .env.example             # 環境変数サンプル
  README.md                # 開発者向けドキュメント
/.github/workflows/ci.yml  # CI/CD（GitHub Actions）
.gitignore                 # Git管理除外
.clinerules                # ToDo/設計指針
```

---

## 主要ディレクトリ・ファイルの役割

- **/docs**: 要件・設計・技術資料を集約。設計変更時は必ず最新化
- **/backend/agent-squad**: agent squad MCPサーバー本体。AI API用途分担・拡張ポイント
- **/backend/linebot**: LINE Bot Webhook/APIサーバー。Express+@line/bot-sdk
- **/backend/db**: Prisma ORMスキーマ・マイグレーション・初期データ
- **/backend/tests**: 各種テストコード（Vitest/Jest）
- **Dockerfile/docker-compose.yml**: ローカル開発・AWS移行両対応
- **.env.example**: APIキー・DB接続等の環境変数サンプル
- **README.md**: 開発者向けセットアップ・運用ガイド
- **.github/workflows/ci.yml**: PR時の自動テスト・ビルド・カバレッジ
- **.clinerules**: ToDo/設計指針・AI用途分担・注意点

---

## 今後の拡張ポイント

- /frontend（管理画面・Web UI追加時）
- /cdk（AWS CDKスタック置き場）
- /backend/agent-squad/tools（新AI API追加時に拡張）
- /backend/db（DynamoDB/RDS等への移行）
