# career-lp｜AI研修付き転職支援プログラム LP＋申込システム

現場経験者向け転職支援プログラムのLP・申込フォーム・審査管理画面です。
技術スタックや表記ルールは [CLAUDE.md](./CLAUDE.md) を参照してください。

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # 値を設定（フェーズ2以降で必要）
npm run dev                        # http://localhost:3000
```

## ページ構成

| パス | 内容 |
| --- | --- |
| `/` | LP（ヒーロー〜申込フォーム〜フッターの1ページ構成） |
| `/skill` | AI実務スキル講座（準備中）の簡易ページ |
| `/privacy` | プライバシーポリシー（雛形・差し替え前提） |

## ディレクトリ構成

```
app/            ページ（App Router）
components/lp/  LPの各セクション
lib/supabase/   Supabaseクライアント（フェーズ2〜）
lib/ai/         AI一次判定（フェーズ3〜）
supabase/       DBマイグレーションSQL
```

---

## 動作確認手順

### フェーズ1：LP

1. `npm run dev` で起動し `http://localhost:3000` を開く
2. 上から順に以下のセクションが表示されること：
   ヒーロー → こんな方へ（3条件） → 特徴3つ → 6週間の流れ → 受講の条件 → よくある質問 → 申込フォーム（器） → フッター
3. ヒーローの「申込フォームへ」ボタンで申込セクションまでスクロールすること
4. よくある質問の各項目がクリックで開閉すること（アコーディオン）
5. フッターの「プライバシーポリシー」→ `/privacy`、
   「AIスキルのみ学びたい方向けの有料講座はこちら」→ `/skill` に遷移すること
6. `/skill` ページに「転職」「求人」「紹介」の語が含まれていないこと（表記ルール）
7. スマホ幅（375px前後）で表示崩れがないこと（モバイルファースト）
8. ブラウザタブにfaviconが表示されること。
   OGPは `curl -s http://localhost:3000 | grep og:` でメタタグを確認できる

### フェーズ2：申込フォーム＋Supabase保存

事前準備：

1. Supabaseプロジェクトを作成し、SQL Editorで
   `supabase/migrations/0001_applications.sql` を実行する
2. `.env.local` に以下を設定する：
   - `NEXT_PUBLIC_SUPABASE_URL`（Settings > API の Project URL）
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`（同 anon public キー）
   - `SUPABASE_SERVICE_ROLE_KEY`（同 service_role キー。サーバー専用）

確認手順：

1. `npm run dev` で起動し、LPの申込セクションまでスクロール
2. 設問1で「転職したい」を選ぶと設問2・3・6が表示され、
   「AIスキルを学びたい」を選ぶと非表示になること（設問番号も詰まる）
3. 未入力で送信するとエラーメッセージが各設問の下に表示されること
4. すべて入力して送信すると「お申込みを受け付けました／24時間以内にメールで
   ご案内します」の完了表示に切り替わること（確認画面なし・1画面完結）
5. 送信中はボタンが「送信中…」になり連打できないこと（二重送信防止）
6. Supabaseの Table Editor で applications に行が追加され、
   status が `pending` であること
7. RLSの確認：anonキーで `select` すると0件になること
   （SQL Editorで `set role anon; select * from applications;` → 0件）
