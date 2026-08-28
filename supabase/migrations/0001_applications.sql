-- 申込データ（LPの申込フォームから保存される）
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 申込者情報
  name text not null,
  email text not null,
  phone text,

  -- 設問1：ご希望（career=転職したい / skill=AIスキルを学びたい）
  desired_track text not null check (desired_track in ('career', 'skill')),
  -- 設問2：転職して就きたい仕事（careerのみ必須）
  desired_job text,
  -- 設問3：希望時期（careerのみ）
  desired_timing text check (desired_timing in ('within_3m', 'within_6m', 'within_1y', 'undecided')),
  -- 設問4：これまでの仕事で判断・管理していたこと（必須）
  judgment_experience text not null,
  -- 設問5：週に確保できる時間
  weekly_hours text not null check (weekly_hours in ('4h_plus', '2h_4h', 'under_2h')),
  -- 設問6：3週目から応募が始まることへの同意（careerのみ必須）
  agreed_week3_apply boolean not null default false,

  -- 審査ステータス：pending → ai_reviewed → approved / waitlist / skill_route
  status text not null default 'pending'
    check (status in ('pending', 'ai_reviewed', 'approved', 'waitlist', 'skill_route')),
  -- AI一次判定の結果（フェーズ3で保存。最終判断は必ず人間が行う）
  ai_verdict jsonb,
  ai_recommendation text check (ai_recommendation in ('pass', 'review')),
  -- 審査記録（フェーズ4で保存）
  reviewed_at timestamptz,
  reviewer_note text
);

create index applications_status_idx on public.applications (status);
create index applications_created_at_idx on public.applications (created_at desc);

alter table public.applications enable row level security;

-- anon は insert のみ可（申込フォームからの送信）
create policy "anon can insert applications"
  on public.applications
  for insert
  to anon
  with check (true);

-- select は認証済み管理者のみ（管理画面は招待制のためauthenticated=管理者）
create policy "authenticated can select applications"
  on public.applications
  for select
  to authenticated
  using (true);

-- 審査（status変更・メモ）のため update も認証済み管理者のみ
create policy "authenticated can update applications"
  on public.applications
  for update
  to authenticated
  using (true)
  with check (true);
