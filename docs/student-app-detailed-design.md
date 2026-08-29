# 受講生アプリ 詳細設計書（career-app）

要件は [student-app-requirements.md](./student-app-requirements.md)（2026-08-29 確定版）に基づく。
本書は実装に直結する詳細設計：DBのDDL・RLS・認証フロー・画面仕様・AI質問室のAPI設計を定める。

---

## 1. 全体構成

- Next.js 14 App Router / TypeScript strict / Tailwind CSS（LPと同一スタック・同一パレット）
- Supabase：LPと**同一プロジェクトを共有**（Auth・DB・Storage）
- デプロイ：Vercel（LPとは別プロジェクト）
- 環境変数（`.env.local.example` に一覧化）：

| 変数 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | マジックリンクのリダイレクト先などに使用 |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase接続 |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー専用（受講生登録・署名付きURL・AIログ書き込み） |
| `ANTHROPIC_API_KEY` | AI質問室 |
| `AI_CHAT_DAILY_LIMIT` | 1人1日の質問上限（既定 20） |

## 2. ディレクトリ構成

```
app/
  login/page.tsx                # メールアドレス入力（マジックリンク送信）
  auth/callback/route.ts        # マジックリンクの code 交換 → セッション確立
  (student)/                    # 受講生シェル（下部タブ付きlayout）
    page.tsx                    # エントランス（ホーム）
    library/page.tsx            # 資料室（週の棚一覧）
    library/[weekId]/page.tsx   # 週の棚（教材一覧・動画埋め込み）
    ai/page.tsx                 # AI質問室（スレッド一覧＋新規質問）
    ai/[threadId]/page.tsx      # チャット画面
    booking/page.tsx            # 予約室（面談枠一覧・自分の予約）
    menu/page.tsx               # その他の部屋（入口メニュー）
    assignments/page.tsx        # 課題提出室（一覧）
    assignments/[id]/page.tsx   # 課題詳細・提出フォーム
    tracker/page.tsx            # 応募トラッカー室（careerのみ）
    board/page.tsx              # 掲示板（お知らせ）
    mypage/page.tsx             # マイページ
  admin/                        # 職員室（role=adminのみ）
    layout.tsx                  # role検証＋管理ナビ
    page.tsx                    # ダッシュボード（要対応まとめ）
    students/page.tsx           # 受講生管理（登録・一覧）
    materials/page.tsx          # 週・教材の管理
    assignments/page.tsx        # 提出マトリクス（週×受講生）
    attendance/page.tsx         # 出欠記録
    tracker/page.tsx            # 応募ダッシュボード
    slots/page.tsx              # 面談枠の管理・予約状況
    announcements/page.tsx      # お知らせ配信
    ai-logs/page.tsx            # AI質問ログ
  api/ai-chat/route.ts          # AI質問API（POST）
components/                     # rooms/, admin/, ui/（タブナビ・バッジ等）
lib/
  supabase/{client,server,serviceRole,middleware}.ts   # LPと同構成
  ai/tutor.ts                   # システムプロンプト定数＋呼び出し
  constants.ts / types.ts / format.ts
middleware.ts                   # 認証ガード
supabase/migrations/0001_career_app_schema.sql
```

## 3. 認証・ユーザー管理

### 3.1 受講生の招待フロー（招待制）

1. adminが職員室（/admin/students）で「氏名・メール・track・cohort」を登録
2. サーバー側（service role）で `auth.admin.createUser({ email, email_confirm: true })` → 返ってきた `user.id` で `profiles` に insert
3. 受講生には「アプリのURLとログイン方法」をLINE等で案内（メール送信機能は作らない）

### 3.2 ログインフロー（マジックリンク）

1. `/login` でメールアドレス入力 → `signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: SITE_URL + "/auth/callback" } })`
   - `shouldCreateUser: false` により**未招待アドレスではログイン不可**
2. メール内リンク → `/auth/callback` で `exchangeCodeForSession` → ホームへリダイレクト
3. `middleware.ts`：未ログインで `(student)`・`/admin` 配下に来たら `/login` へ。
   `/admin` はさらに layout（サーバー側）で `profiles.role = 'admin'` を検証し、違えばホームへ

### 3.3 役割と表示制御

- `profiles.role`：`student` / `admin`
- `profiles.track`：`career` / `skill`（adminはnull可）
- 応募トラッカー室：`track = 'career'` のみタブ・メニューに表示し、ページ側でも再検証
- 下部タブ：ホーム／資料室／AI質問／予約／その他（adminは職員室タブを追加表示）

## 4. DB詳細設計（DDL全文）

マイグレーション `0001_career_app_schema.sql` として実行する想定。
LP側の `applications`（申込）とは独立。**受講生の応募管理は `job_applications`**。

```sql
create extension if not exists pgcrypto;

-- ── profiles ──
-- 注意：SQL関数（language sql）は作成時に本体が検証されるため、
-- profiles を参照するヘルパー関数より先にテーブルを作成する
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,   -- 職員室の一覧表示用（auth.usersと二重管理になるが参照専用）
  role text not null default 'student' check (role in ('student', 'admin')),
  track text check (track in ('career', 'skill')),
  cohort text,                       -- 例 '2026-1'
  created_at timestamptz not null default now(),
  check (role = 'admin' or (track is not null and cohort is not null))
);

-- ── ヘルパー関数（RLSから利用。security definerでprofilesを参照） ──
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.current_track() returns text
language sql stable security definer set search_path = public as
$$ select track from profiles where id = auth.uid() $$;

create or replace function public.current_cohort() returns text
language sql stable security definer set search_path = public as
$$ select cohort from profiles where id = auth.uid() $$;
alter table public.profiles enable row level security;
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or is_admin());
create policy "profiles_admin_write" on public.profiles for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── weeks（未公開週も受講生に見せる：ロック表示のため。中身=materialsは公開日まで隠す） ──
create table public.weeks (
  id uuid primary key default gen_random_uuid(),
  week_no int not null check (week_no between 1 and 6),
  title text not null,
  goal text,
  publish_at timestamptz not null,
  track text not null default 'common' check (track in ('common', 'career', 'skill')),
  unique (week_no, track)
);
alter table public.weeks enable row level security;
create policy "weeks_select" on public.weeks for select to authenticated
  using (is_admin() or track in ('common', current_track()));
create policy "weeks_admin_write" on public.weeks for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── materials（動画=YouTube限定公開URL / 資料=Storageパス） ──
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  kind text not null check (kind in ('video', 'slide', 'template')),
  title text not null,
  external_url text,                 -- kind=video：YouTube限定公開URL
  storage_path text,                 -- kind=slide/template：materialsバケット内パス
  note text,                         -- 講師の補足メモ
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  check (
    (kind = 'video' and external_url is not null)
    or (kind in ('slide', 'template') and storage_path is not null)
  )
);
alter table public.materials enable row level security;
create policy "materials_select" on public.materials for select to authenticated
  using (
    is_admin() or exists (
      select 1 from public.weeks w
      where w.id = week_id
        and w.publish_at <= now()
        and w.track in ('common', current_track())
    )
  );
create policy "materials_admin_write" on public.materials for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── assignments / submissions ──
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  title text not null,
  description text not null,
  due_at timestamptz not null,
  track text not null default 'common' check (track in ('common', 'career', 'skill'))
);
alter table public.assignments enable row level security;
create policy "assignments_select" on public.assignments for select to authenticated
  using (
    is_admin() or (
      track in ('common', current_track())
      and exists (select 1 from public.weeks w where w.id = week_id and w.publish_at <= now())
    )
  );
create policy "assignments_admin_write" on public.assignments for all to authenticated
  using (is_admin()) with check (is_admin());

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  body text,
  storage_path text,                 -- submissionsバケット内パス（任意添付）
  submitted_at timestamptz not null default now(),
  admin_comment text,                -- 講師コメント（1提出につき1つ）
  unique (assignment_id, student_id) -- 再提出は同一行のupdate
);
alter table public.submissions enable row level security;
create policy "submissions_student_select" on public.submissions for select to authenticated
  using (student_id = auth.uid() or is_admin());
create policy "submissions_student_insert" on public.submissions for insert to authenticated
  with check (student_id = auth.uid());
create policy "submissions_student_update" on public.submissions for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "submissions_admin_update" on public.submissions for update to authenticated
  using (is_admin()) with check (is_admin());

-- ── lesson_slots / bookings（予約は必ずRPC経由。直接insertは不可） ──
create table public.lesson_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  kind text not null default 'meeting' check (kind in ('meeting', 'lecture')), -- 第1期はmeetingのみ使用
  capacity int not null default 1 check (capacity >= 1),
  track text,                        -- null=全トラック対象
  cohort text,                       -- null=全期対象
  note text,
  created_at timestamptz not null default now()
);
alter table public.lesson_slots enable row level security;
create policy "slots_select" on public.lesson_slots for select to authenticated
  using (
    is_admin() or (
      (track is null or track = current_track())
      and (cohort is null or cohort = current_cohort())
    )
  );
create policy "slots_admin_write" on public.lesson_slots for all to authenticated
  using (is_admin()) with check (is_admin());

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.lesson_slots (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'booked' check (status in ('booked', 'cancelled')),
  created_at timestamptz not null default now()
);
create unique index bookings_active_uniq on public.bookings (slot_id, student_id)
  where status = 'booked';
alter table public.bookings enable row level security;
create policy "bookings_select" on public.bookings for select to authenticated
  using (student_id = auth.uid() or is_admin());
-- insert/updateのポリシーは作らない（下記RPCのみ。RPCはsecurity definer）

create or replace function public.book_slot(p_slot_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_slot lesson_slots%rowtype; v_id uuid;
begin
  select * into v_slot from lesson_slots where id = p_slot_id for update;
  if not found then raise exception 'slot_not_found'; end if;
  if v_slot.starts_at <= now() then raise exception 'slot_started'; end if;
  if (select count(*) from bookings where slot_id = p_slot_id and status = 'booked')
       >= v_slot.capacity then raise exception 'slot_full'; end if;
  insert into bookings (slot_id, student_id) values (p_slot_id, auth.uid())
    returning id into v_id;                -- 二重予約はunique indexが弾く
  return v_id;
end $$;

-- 枠ごとの予約数（受講生は他人の予約行を見られないため、満席表示用に集計だけ公開する）
create or replace function public.slot_booked_counts()
returns table (slot_id uuid, booked_count bigint)
language sql stable security definer set search_path = public as
$$ select slot_id, count(*) from bookings where status = 'booked' group by slot_id $$;

create or replace function public.cancel_booking(p_booking_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_starts timestamptz;
begin
  select s.starts_at into v_starts
    from bookings b join lesson_slots s on s.id = b.slot_id
    where b.id = p_booking_id and b.student_id = auth.uid() and b.status = 'booked';
  if not found then raise exception 'booking_not_found'; end if;
  if v_starts - interval '24 hours' <= now() then raise exception 'cancel_deadline_passed'; end if;
  update bookings set status = 'cancelled' where id = p_booking_id;
end $$;

-- ── AI質問室（書き込みはAPIルートがservice roleで実施。受講生は自分の履歴をselectのみ） ──
create table public.ai_chat_threads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,               -- 先頭質問の冒頭から自動生成
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
alter table public.ai_chat_threads enable row level security;
create policy "threads_select" on public.ai_chat_threads for select to authenticated
  using (student_id = auth.uid() or is_admin());

create table public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_chat_threads (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade, -- レート制限集計用に非正規化
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index ai_msg_rate_idx on public.ai_chat_messages (student_id, role, created_at);
alter table public.ai_chat_messages enable row level security;
create policy "messages_select" on public.ai_chat_messages for select to authenticated
  using (student_id = auth.uid() or is_admin());

-- ── job_applications（応募トラッカー。careerトラック専用） ──
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  company text not null,
  applied_on date not null,
  channel text,                      -- 経路（求人サイト・エージェント・直接応募など自由入力）
  status text not null default 'applied' check (
    status in ('applied', 'doc_passed', 'interview_scheduling', 'interviewed', 'offer', 'rejected')
  ),
  memo text,
  updated_at timestamptz not null default now()
);
alter table public.job_applications enable row level security;
create policy "jobapps_student_all" on public.job_applications for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "jobapps_admin_select" on public.job_applications for select to authenticated
  using (is_admin());

-- ── announcements / 既読 ──
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  target text not null default 'all' check (target in ('all', 'track', 'cohort')),
  target_track text check (target_track in ('career', 'skill')),
  target_cohort text,
  published_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy "announcements_select" on public.announcements for select to authenticated
  using (
    is_admin()
    or target = 'all'
    or (target = 'track' and target_track = current_track())
    or (target = 'cohort' and target_cohort = current_cohort())
  );
create policy "announcements_admin_write" on public.announcements for all to authenticated
  using (is_admin()) with check (is_admin());

create table public.announcement_reads (
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, student_id)
);
alter table public.announcement_reads enable row level security;
create policy "reads_own" on public.announcement_reads for all to authenticated
  using (student_id = auth.uid() or is_admin())
  with check (student_id = auth.uid());

-- ── attendance（出欠。adminのみ書き込み） ──
create table public.attendance (
  week_id uuid not null references public.weeks (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('present', 'recorded', 'absent')), -- 出席/録画補講/欠席
  noted_at timestamptz not null default now(),
  primary key (week_id, student_id)
);
alter table public.attendance enable row level security;
create policy "attendance_select" on public.attendance for select to authenticated
  using (student_id = auth.uid() or is_admin());
create policy "attendance_admin_write" on public.attendance for all to authenticated
  using (is_admin()) with check (is_admin());
```

## 5. Storage設計

| バケット | 公開 | パス規約 | 権限 |
| --- | --- | --- | --- |
| `materials` | private | `{week_no}/{ファイル名}` | 書き込み：admin。受講生の閲覧は**署名付きURLのみ**（サーバーでRLS相当の判定後、service roleで `createSignedUrl`、有効期限60分） |
| `submissions` | private | `{student_id}/{assignment_id}/{ファイル名}` | 受講生は自分のフォルダにのみ insert/select（`storage.objects` ポリシーで `(storage.foldername(name))[1] = auth.uid()::text`）。adminは全件select |

- 動画はStorageに置かない（YouTube限定公開。`materials.external_url` に保存し、資料室にiframe埋め込み）
- 添付ファイルの上限：10MB／許可拡張子：pdf, png, jpg, docx, xlsx, pptx（クライアント＋サーバー両方で検証）

## 6. 画面詳細設計

### 受講生側

| 画面 | 主な要素 | 主な操作 |
| --- | --- | --- |
| エントランス `/` | 今週カード（週タイトル・ゴール・講義日・課題締切）／未読お知らせバッジ／次の予約／締切接近バッジ（72時間以内・未提出） | 各部屋への導線 |
| 資料室 `/library` | 第1〜6週の棚。未公開週はロック表示（公開日を明記） | 週を開く |
| 週の棚 `/library/[weekId]` | 週のゴール／種類フィルタ（動画・スライド・テンプレ）／動画はYouTube埋め込み／資料は「開く」で署名付きURL | フィルタ切替・閲覧 |
| AI質問室 `/ai` | スレッド一覧（新しい順）／「新しく質問する」／本日の残り質問数 | スレッド作成・再開 |
| チャット `/ai/[threadId]` | メッセージ履歴／入力欄／送信中表示／上限到達時の案内 | 質問送信 |
| 予約室 `/booking` | 自分の予約（次回・過去）／空き枠一覧（日時順） | 予約・キャンセル（24時間前まで） |
| その他 `/menu` | 課題提出室・応募トラッカー室（careerのみ）・掲示板・マイページへのカード | 移動 |
| 課題一覧 `/assignments` | 公開済み課題（締切・提出状況バッジ） | 課題を開く |
| 課題詳細 `/assignments/[id]` | 説明／締切／提出フォーム（テキスト＋任意添付）／提出済み表示／講師コメント | 提出・再提出 |
| 応募トラッカー `/tracker` | 応募カード（企業名・ステータス・更新日）／追加フォーム | 追加・ステータス更新・メモ |
| 掲示板 `/board` | お知らせ一覧（未読を強調） | 開くと既読化 |
| マイページ `/mypage` | 氏名・track・期／出席・提出サマリ／ログアウト | ログアウト |

### 職員室（admin）

| 画面 | 主な要素 |
| --- | --- |
| ダッシュボード `/admin` | 要対応まとめ：未コメントの提出／応募0件・1週間更新なし（career）／無断欠席2回／未予約者 |
| 受講生管理 `/admin/students` | 登録フォーム（氏名・メール・track・cohort）→ service roleでAuthユーザー作成＋profiles insert／一覧 |
| 教材管理 `/admin/materials` | 週の作成・公開日設定／教材の追加（動画URL or ファイルアップロード）・並び順 |
| 提出マトリクス `/admin/assignments` | 週×受講生の表。未提出=赤系・提出済み=ティール・コメント済み=ネイビー。セルから提出内容＋コメント入力 |
| 出欠 `/admin/attendance` | 週×受講生の出欠入力（出席/録画補講/欠席）。無断欠席2回以上の行を強調 |
| 応募ダッシュボード `/admin/tracker` | 受講生ごとの応募数・最新更新。応募0件／1週間更新なしを強調（週次面談の準備画面） |
| 枠管理 `/admin/slots` | 面談枠の作成（日時・対象）／予約状況／未予約者一覧 |
| お知らせ `/admin/announcements` | 作成（対象：全体/track/期）・一覧 |
| AIログ `/admin/ai-logs` | スレッド一覧（受講生・日時・タイトル）→ 会話閲覧 |

## 7. AI質問室 詳細

### 7.1 API（`POST /api/ai-chat`）

```
リクエスト: { threadId?: string, message: string }   // threadIdなし＝新規スレッド
処理:
 1. 認証チェック（未ログイン401）。profilesからtrack取得
 2. レート制限：ai_chat_messages で当日（JST）の role='user' 件数を集計
    → AI_CHAT_DAILY_LIMIT 以上なら 429 {remaining: 0}
 3. スレッド作成 or 取得（本人のものか検証）
 4. user メッセージを保存（service role）
 5. 直近10往復を messages として Anthropic API を呼ぶ
    - model: claude-opus-5 / max_tokens: 2048 / output_config: { effort: "medium" }
    - system: TUTOR_PROMPT（下記）＋ 受講生のtrackを付与
    - タイムアウト45秒。失敗時はuserメッセージを残したまま 502
      （UIは「時間をおいて再送してください」。再送時は同メッセージを再利用）
 6. assistant メッセージを保存、thread.last_message_at 更新
 7. レスポンス: { threadId, reply, remaining }
```

### 7.2 システムプロンプト（コード内定数・草案）

```
あなたは6週間のAI実務プログラムの受講生を支える「チューター」です。
丁寧な敬語で、専門用語をかみ砕き、受講生の取り組みを認めながら導いてください。

答えてよい範囲：
- 講義内容の復習、Copilot・AIツールの操作方法、課題の考え方のヒント
答え方のルール：
- まず結論を短く、その後に手順や補足。1回の回答は長くしすぎない
- 課題の「答え」そのものは書かず、考え方のヒントと次の一歩を示す
- 個別の応募先の選定・選考結果の判断・企業とのやり取りは回答せず、
  「週次面談で講師にご相談ください」と案内する
- わからないことは推測で断定せず、講師への確認を勧める
表記のルール（必ず守る）：
- 受講生がスキルトラックの場合、転職・応募に関する話題を出さない
- プログラム費用の話題では「無料」と言わず「費用は採用企業側負担」と表現する
```

### 7.3 コスト・運用

- 上限は `AI_CHAT_DAILY_LIMIT`（既定20問/日）。残数はチャット画面に常時表示
- 第1期はRAGなし。講座の要点（週ごとのテーマ一覧）をシステムプロンプト末尾に定数で持つ
- 職員室のAIログは閲覧のみ（編集・削除なし）

## 8. 共通UI・ナビゲーション

- 下部タブ（モバイル固定）：ホーム／資料室／AI質問／予約／その他。`track='skill'` にはトラッカーを一切出さない。adminは「職員室」タブ追加
- バッジ：お知らせ未読数（announcements − reads）／課題締切72時間以内・未提出
- 配色・フォントはLPと同一（ネイビー #12303D／オレンジ #E8833A／ティール #1C7293／薄地 #EFF4F6、Noto Sans JP）。アイコンは白抜きの線画SVGで統一（絵文字不使用）
- 日時表示はすべて `Asia/Tokyo`

## 9. 実装フェーズとタスク分解

| フェーズ | 主なタスク | 完了条件（動作確認の要点） |
| --- | --- | --- |
| 1 認証・基盤 | マイグレーション実行／login・callback／middleware／(student)レイアウト＋下部タブ／admin layout（role検証）／受講生登録（/admin/students） | 招待した受講生だけがマジックリンクでログインでき、admin以外は/adminに入れない |
| 2 資料室 | weeks・materials管理画面／資料室・週の棚／YouTube埋め込み／署名付きURL／公開日ロック | 未公開週がロック表示され、公開後に教材が見える。直リンクで資料が開けない |
| 3 予約室 | 枠管理／予約・キャンセル（RPC）／ホームの次回予約／未予約者一覧 | 定員1の枠に2人目が予約できない。開始24時間前を過ぎるとキャンセル不可 |
| 4 課題提出室 | 課題管理／提出フォーム（添付つき）／提出マトリクス／講師コメント | 再提出で上書きされ、マトリクスの色が変わる。他人の提出が見えない |
| 5 AI質問室 | /api/ai-chat／チャットUI／残数表示／AIログ閲覧 | 上限到達で429となりUIに案内が出る。skillトラックへの回答に転職の話題が出ない |
| 6 トラッカー・掲示板・出欠 | 応募トラッカー／応募ダッシュボード／お知らせ＋既読／出欠／ダッシュボード完成 | skillトラックにトラッカーが表示されない。無断欠席2回が強調される |

## 10. 実装時に確認する事項（軽微）

1. アプリの正式名称（タブ・タイトルに表示する名前）
2. 第1期の cohort 文字列（例：`2026-1`）と講義の固定曜日・時刻（ホームに表示する値）
3. YouTube限定公開動画を置くチャンネルの運用者
4. career-app リポジトリの作成方法（新規リポジトリを用意いただくか、こちらで雛形を作るか）
