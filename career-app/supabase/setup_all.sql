-- ============================================================
-- 一括セットアップSQL（冪等：何度実行してもエラーになりません）
-- 内容：
--   ① 受講生アプリの全テーブル・関数・RLS（0001_career_app_schema.sql）
--   ② Storageバケットとポリシー（0002_storage.sql）
--   ③ LP申込データの閲覧を管理者限定に強化（0002_applications_admin_only.sql）
-- 使い方：SupabaseのSQL Editorで新しいクエリに全文を貼り付けて実行
-- ============================================================

-- ============ ① 受講生アプリ スキーマ ============

create extension if not exists pgcrypto;

-- ── profiles ──
-- 注意：SQL関数（language sql）は作成時に本体が検証されるため、
-- profiles を参照するヘルパー関数より先にテーブルを作成する
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
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
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or is_admin());
drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write" on public.profiles for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── weeks（未公開週も受講生に見せる：ロック表示のため。中身=materialsは公開日まで隠す） ──
create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  week_no int not null check (week_no between 1 and 6),
  title text not null,
  goal text,
  publish_at timestamptz not null,
  track text not null default 'common' check (track in ('common', 'career', 'skill')),
  unique (week_no, track)
);
alter table public.weeks enable row level security;
drop policy if exists "weeks_select" on public.weeks;
create policy "weeks_select" on public.weeks for select to authenticated
  using (is_admin() or track in ('common', current_track()));
drop policy if exists "weeks_admin_write" on public.weeks;
create policy "weeks_admin_write" on public.weeks for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── materials（動画=YouTube限定公開URL / 資料=Storageパス） ──
create table if not exists public.materials (
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
drop policy if exists "materials_select" on public.materials;
create policy "materials_select" on public.materials for select to authenticated
  using (
    is_admin() or exists (
      select 1 from public.weeks w
      where w.id = week_id
        and w.publish_at <= now()
        and w.track in ('common', current_track())
    )
  );
drop policy if exists "materials_admin_write" on public.materials;
create policy "materials_admin_write" on public.materials for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── assignments / submissions ──
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  title text not null,
  description text not null,
  due_at timestamptz not null,
  track text not null default 'common' check (track in ('common', 'career', 'skill'))
);
alter table public.assignments enable row level security;
drop policy if exists "assignments_select" on public.assignments;
create policy "assignments_select" on public.assignments for select to authenticated
  using (
    is_admin() or (
      track in ('common', current_track())
      and exists (select 1 from public.weeks w where w.id = week_id and w.publish_at <= now())
    )
  );
drop policy if exists "assignments_admin_write" on public.assignments;
create policy "assignments_admin_write" on public.assignments for all to authenticated
  using (is_admin()) with check (is_admin());

create table if not exists public.submissions (
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
drop policy if exists "submissions_student_select" on public.submissions;
create policy "submissions_student_select" on public.submissions for select to authenticated
  using (student_id = auth.uid() or is_admin());
drop policy if exists "submissions_student_insert" on public.submissions;
create policy "submissions_student_insert" on public.submissions for insert to authenticated
  with check (student_id = auth.uid());
drop policy if exists "submissions_student_update" on public.submissions;
create policy "submissions_student_update" on public.submissions for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
drop policy if exists "submissions_admin_update" on public.submissions;
create policy "submissions_admin_update" on public.submissions for update to authenticated
  using (is_admin()) with check (is_admin());

-- ── lesson_slots / bookings（予約は必ずRPC経由。直接insertは不可） ──
create table if not exists public.lesson_slots (
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
drop policy if exists "slots_select" on public.lesson_slots;
create policy "slots_select" on public.lesson_slots for select to authenticated
  using (
    is_admin() or (
      (track is null or track = current_track())
      and (cohort is null or cohort = current_cohort())
    )
  );
drop policy if exists "slots_admin_write" on public.lesson_slots;
create policy "slots_admin_write" on public.lesson_slots for all to authenticated
  using (is_admin()) with check (is_admin());

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.lesson_slots (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'booked' check (status in ('booked', 'cancelled')),
  created_at timestamptz not null default now()
);
create unique index if not exists bookings_active_uniq on public.bookings (slot_id, student_id)
  where status = 'booked';
alter table public.bookings enable row level security;
drop policy if exists "bookings_select" on public.bookings;
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
create table if not exists public.ai_chat_threads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,               -- 先頭質問の冒頭から自動生成
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
alter table public.ai_chat_threads enable row level security;
drop policy if exists "threads_select" on public.ai_chat_threads;
create policy "threads_select" on public.ai_chat_threads for select to authenticated
  using (student_id = auth.uid() or is_admin());

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_chat_threads (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade, -- レート制限集計用に非正規化
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index ai_msg_rate_idx on public.ai_chat_messages (student_id, role, created_at);
alter table public.ai_chat_messages enable row level security;
drop policy if exists "messages_select" on public.ai_chat_messages;
create policy "messages_select" on public.ai_chat_messages for select to authenticated
  using (student_id = auth.uid() or is_admin());

-- ── job_applications（応募トラッカー。careerトラック専用） ──
create table if not exists public.job_applications (
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
drop policy if exists "jobapps_student_all" on public.job_applications;
create policy "jobapps_student_all" on public.job_applications for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
drop policy if exists "jobapps_admin_select" on public.job_applications;
create policy "jobapps_admin_select" on public.job_applications for select to authenticated
  using (is_admin());

-- ── announcements / 既読 ──
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  target text not null default 'all' check (target in ('all', 'track', 'cohort')),
  target_track text check (target_track in ('career', 'skill')),
  target_cohort text,
  published_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
drop policy if exists "announcements_select" on public.announcements;
create policy "announcements_select" on public.announcements for select to authenticated
  using (
    is_admin()
    or target = 'all'
    or (target = 'track' and target_track = current_track())
    or (target = 'cohort' and target_cohort = current_cohort())
  );
drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write" on public.announcements for all to authenticated
  using (is_admin()) with check (is_admin());

create table if not exists public.announcement_reads (
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, student_id)
);
alter table public.announcement_reads enable row level security;
drop policy if exists "reads_own" on public.announcement_reads;
create policy "reads_own" on public.announcement_reads for all to authenticated
  using (student_id = auth.uid() or is_admin())
  with check (student_id = auth.uid());

-- ── attendance（出欠。adminのみ書き込み） ──
create table if not exists public.attendance (
  week_id uuid not null references public.weeks (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('present', 'recorded', 'absent')), -- 出席/録画補講/欠席
  noted_at timestamptz not null default now(),
  primary key (week_id, student_id)
);
alter table public.attendance enable row level security;
drop policy if exists "attendance_select" on public.attendance;
create policy "attendance_select" on public.attendance for select to authenticated
  using (student_id = auth.uid() or is_admin());
drop policy if exists "attendance_admin_write" on public.attendance;
create policy "attendance_admin_write" on public.attendance for all to authenticated
  using (is_admin()) with check (is_admin());


-- ============ ② Storage ============

-- Storageバケットとポリシー
-- materials   : 教材（PDF・テンプレ）。書き込みはadminのみ。受講生の閲覧は署名付きURL（サーバー発行）のみ
-- submissions : 課題の添付。受講生は自分のフォルダ（{student_id}/...）のみ読み書き

insert into storage.buckets (id, name, public)
values ('materials', 'materials', false), ('submissions', 'submissions', false)
on conflict (id) do nothing;

drop policy if exists "materials_admin_all" on storage.objects;
create policy "materials_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'materials' and public.is_admin())
  with check (bucket_id = 'materials' and public.is_admin());

drop policy if exists "submissions_student_read" on storage.objects;
create policy "submissions_student_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'submissions'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );

drop policy if exists "submissions_student_insert" on storage.objects;
create policy "submissions_student_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============ ③ LP申込データのRLS強化 ============

-- 受講生アプリ（career-app）導入に伴うRLSの強化。
-- LPと同じSupabaseプロジェクトに受講生もログインするようになるため、
-- 「認証済みなら申込データを読める」ままだと受講生から申込者の個人情報が見えてしまう。
-- 閲覧・更新を管理者（profiles.role = 'admin'）に限定する。
--
-- 実行順序：career-app/supabase/migrations/0001_career_app_schema.sql を先に実行すること
-- （profiles テーブルと is_admin() 関数を利用するため）

drop policy if exists "authenticated_can_select_applications" on public.applications;
drop policy if exists "authenticated_can_update_applications" on public.applications;

drop policy if exists "admin_can_select_applications" on public.applications;
create policy "admin_can_select_applications"
  on public.applications
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin_can_update_applications" on public.applications;
create policy "admin_can_update_applications"
  on public.applications
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ============ 確認 ============
-- 実行後、以下が表示されれば成功（tables_created=13, functions_created=6）
select
  (select count(*) from information_schema.tables
    where table_schema = 'public'
      and table_name in ('profiles','weeks','materials','assignments','submissions',
        'lesson_slots','bookings','ai_chat_threads','ai_chat_messages',
        'job_applications','announcements','announcement_reads','attendance')) as tables_created,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('is_admin','current_track','current_cohort',
        'book_slot','cancel_booking','slot_booked_counts')) as functions_created;
