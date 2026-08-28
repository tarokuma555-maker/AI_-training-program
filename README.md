# career-lp｜AI研修付き転職支援プログラム LP・申込システム

現場経験者向け転職支援プログラムの LP＋申込フォーム＋審査管理画面です。
プロジェクト共通ルールは [CLAUDE.md](./CLAUDE.md) を参照してください。

## 技術スタック

- Next.js 14（App Router）/ TypeScript strict / Tailwind CSS
- Supabase（Auth・DB）
- Anthropic API（申込内容のAI一次判定）
- デプロイ先：Vercel 想定

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # 値を設定（フェーズ2以降で使用）
npm run dev
```

http://localhost:3000 で起動します。

## ページ構成

| パス | 内容 |
| --- | --- |
| `/` | LP（ヒーロー〜申込フォーム〜フッター） |
| `/skill` | AI実務スキル講座（準備中）ページ |
| `/privacy` | プライバシーポリシー（雛形） |

---

## 動作確認手順

### フェーズ1：LP

1. `npm run dev` で起動し、http://localhost:3000 を開く
2. ヒーローの「申込フォームへ」ボタンで、ページ内の申込セクションまでスクロールすること
3. セクションが上から「ヒーロー → こんな方へ → 特徴 → 6週間の流れ → 受講の条件 → よくある質問 → 申込フォーム（器のみ） → フッター」の順に並んでいること
4. よくある質問の各項目をタップすると開閉すること（アコーディオン）
5. フッターの「プライバシーポリシー」リンクで `/privacy` が開くこと
6. フッターの「AIスキルのみ学びたい方向けの有料講座はこちら」リンクで `/skill` が開くこと。`/skill` ページ内に「転職」「求人」「紹介」の語が含まれていないこと
7. スマホ幅（375px）とPC幅の両方でレイアウトが崩れないこと
8. ページのタイトル・OGP（`view-source:` で `og:title` 等）・favicon が設定されていること

### フェーズ2：申込フォーム＋Supabase保存

事前準備：

1. Supabaseプロジェクトを作成し、`.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定する
2. Supabaseダッシュボードの SQL Editor で `supabase/migrations/0001_create_applications.sql` を実行する
   （`applications` テーブル作成＋RLS有効化。anon は insert のみ可）

確認手順：

1. `npm run dev` で起動し、LPの申込セクションを開く
2. ご希望で「転職したい」を選ぶと、「転職して就きたい仕事」「希望時期」「3週目から応募が始まることへの同意」が表示されること。「AIスキルを学びたい」ではこれらが表示されないこと
3. 未入力のまま送信すると、エラーメッセージが表示され送信されないこと
4. すべて入力して送信すると、完了画面「24時間以内にメールでご案内します」が表示されること
5. 送信中はボタンが「送信中…」になり連打できないこと（二重送信防止）
6. Supabaseダッシュボードの Table Editor で `applications` に行が入っていること（`status = pending`）
7. anon キーでの select が拒否されることの確認（任意）：ブラウザのコンソール等から anon キーで
   `applications` を select しても行が返らないこと（RLSにより insert のみ許可）
