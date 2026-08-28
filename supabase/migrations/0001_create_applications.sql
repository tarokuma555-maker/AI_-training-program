-- 申込テーブル
-- status の遷移: pending → ai_reviewed → approved / waitlist / skill_route
--   pending      … 申込直後（AI一次判定が未実行 or 失敗）
--   ai_reviewed  … AI一次判定済み（最終判断は管理画面で人間が行う）
--   approved     … 承認（無料相談のご案内へ）
--   waitlist     … 見送り（次期のご案内へ）
--   skill_route  … スキル講座のご案内へ

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 設問1: ご希望（career=転職したい / skill=AIスキルを学びたい）
  desire text not null check (desire in ('career', 'skill')),
  -- 設問2: 転職して就きたい仕事（desire=career のとき必須）
  target_job text,
  -- 設問3: 希望時期（desire=career のとき必須）
  desired_timing text check (
    desired_timing in ('within_3_months', 'within_6_months', 'within_1_year', 'undecided')
  ),
  -- 設問4: これまでの仕事で判断・管理していたこと（必須）
  managed_experience text not null,
  -- 設問5: 週に確保できる時間（必須）
  weekly_hours text not null check (
    weekly_hours in ('4h_plus', '2_4h', 'under_2h')
  ),
  -- 設問6: 3週目から応募が始まることへの同意（desire=career のとき必須）
  agree_apply_week3 boolean not null default false,

  -- 連絡先
  name text not null,
  email text not null,
  phone text,

  -- 審査状態
  status text not null default 'pending' check (
    status in ('pending', 'ai_reviewed', 'approved', 'waitlist', 'skill_route')
  ),

  -- AI一次判定（最終判断は人間が行う。AIは status を approved にしない）
  ai_verdict jsonb,
  ai_recommendation text check (ai_recommendation in ('pass', 'review')),

  -- 管理画面での最終判断の記録
  reviewed_at timestamptz,
  reviewer_note text
);

create index if not exists applications_created_at_idx
  on public.applications (created_at desc);
create index if not exists applications_status_idx
  on public.applications (status);

-- RLS: anon は insert のみ可 / select・update は認証済み管理者のみ
alter table public.applications enable row level security;

create policy "anon_can_insert_applications"
  on public.applications
  for insert
  to anon
  with check (true);

create policy "authenticated_can_select_applications"
  on public.applications
  for select
  to authenticated
  using (true);

create policy "authenticated_can_update_applications"
  on public.applications
  for update
  to authenticated
  using (true)
  with check (true);
