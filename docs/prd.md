# 要件定義書（PRD）  
## プロジェクト名  
LINE × agent squad クイズ自動生成チャットボット PoC

---

## 1. 目的・背景

- AWS資格取得などの学習支援を目的とし、ユーザーがLINEで連携した資料（URL等）をもとにAIがクイズを自動生成・出題するチャットボットのPoCを開発する
- agent squadフレームワークを活用し、AI API（OpenAI/Gemini/Grok/Groq）を用途ごとに最適化してコスト・品質を両立
- 本PoCはローカルDocker Composeで開発し、将来的なAWS本番移行を見据える

---

## 2. 機能要件

- LINE公式アカウントと連携し、ユーザーが資料URLを送信できる
- Webhook/APIサーバー（Express/TypeScript）が資料URLを受信
- agent squad（MCPサーバー/TypeScript）に資料URLを渡し、AIでクイズを自動生成
- クイズをLINE Bot経由でユーザーに出題・回答受付・正誤判定・解説返信
- クイズ履歴・成績をユーザーごとに管理（PoCはSQLite、本番はDynamoDB等）
- API利用ログをDBに記録し、用途・コストを可視化
- テスト・CI/CD・ドキュメントを常に最新に保つ

---

## 3. 非機能要件

- すべてTypeScriptで統一
- Docker Composeでローカル開発、本番はAWS（ECS Fargate/App Runner/Lambda）を想定
- セキュリティ（Webhook署名検証、APIキー・エンドポイントの.env管理、ファイルサイズ制限、認可）
- スケーラビリティ・拡張性（AI API用途分担、MCPツール拡張、DB移行容易性）
- CI/CD（GitHub Actionsで自動テスト・ビルド・デプロイ）
- ログ・監査（API利用ログ、成績履歴）

---

## 4. ユーザーストーリー

- ユーザーはLINEでBotを友だち追加し、資料URLを送信できる
- BotがAIでクイズを自動生成し、LINEで出題・回答・解説を返す
- ユーザーは自分の成績・履歴を確認できる
- 管理者はAPI利用状況・コストを把握できる

---

## 5. スコープ・制約

- PoC段階では資料はURLのみ（ファイル添付は将来拡張）
- AI APIはOpenAI/Gemini/Grok/Groqのみ（Bedrock等は対象外）
- DBはSQLite（本番はDynamoDB/RDS等に移行）
- LINE Botのリッチメニュー等は将来拡張

---

## 6. 今後の拡張方針

- ファイル添付・画像対応
- クイズ難易度・出題形式の多様化
- 管理画面（API利用状況・コスト可視化）
- AWS本番移行（ECR/ECS/App Runner/Lambda/CDK）
- セキュリティ・監査強化
