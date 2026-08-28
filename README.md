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

### フェーズ3：AI一次判定

事前準備：

1. `.env.local` に `ANTHROPIC_API_KEY` を設定する（[Anthropic Console](https://console.anthropic.com/) で発行）

確認手順：

1. 申込フォームで「転職したい」を選び、すべて入力して送信する
2. Supabaseの Table Editor で該当行を確認：
   - `status` が `ai_reviewed` になっていること
   - `ai_verdict` に3観点（q2_specific_goal / q4_judgment_experience /
     q3_q5_realistic）のYES/NOと日本語1行の理由が入っていること
   - YESが2つ以上なら `ai_recommendation` が `pass`、それ以外は `review`
3. 「AIスキルを学びたい」で送信した場合はAI判定の対象外
   （`status=pending` のまま。設問2・3が無いため。管理画面で振り分ける）
4. 失敗時の挙動：`ANTHROPIC_API_KEY` を空にして送信しても
   申込は完了表示になり、行は `status=pending` のまま保存されること
   （判定失敗は申込者に見せない）

補足：AI判定はstatusを自動で `approved` にせず、`ai_reviewed` で止まります。
最終判断は必ず管理画面（フェーズ4）で人間が行います。

### フェーズ4：審査管理画面（/admin）

事前準備（管理者1名・招待制）：

1. Supabaseダッシュボード > Authentication > Users >「Invite user」で
   管理者のメールアドレスを招待する（サインアップは開放しない運用。
   Authentication > Sign In / Up で「Allow new users to sign up」をオフ推奨）
2. Authentication > URL Configuration で
   - Site URL：`http://localhost:3000`（本番はデプロイURL）
   - Redirect URLs：`http://localhost:3000/auth/callback` を追加

確認手順：

1. 未ログインで `http://localhost:3000/admin` を開くと
   `/admin/login` にリダイレクトされること
2. 招待済みメールアドレスでログインリンクを送信し、メール内リンクから
   `/admin` に入れること（未招待のアドレスではエラーになること）
3. 申込一覧に「日時／氏名／希望／AI判定結果と理由／ステータス」が
   新しい順に表示されること
4. 「詳細」から全回答・AI判定理由が閲覧できること
5. 審査メモを入力して「承認（無料相談案内へ）」等のボタンを押すと、
   ステータスが変わり、`reviewed_at` と `reviewer_note` が保存されること
   （一覧に戻るとバッジが更新されている）
6. 「案内メールの定型文」の各ボタンでクリップボードに文面がコピーされること
   （見送り文面は ①講座見送り→②転職支援の案内→③次期優先案内→④末尾に有料講座 の順。
   文面はプレースホルダなので後で差し替える）
7. ヘッダーの「ログアウト」で `/admin/login` に戻ること
