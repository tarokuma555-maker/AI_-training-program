-- 受講生アプリ（career-app）導入に伴うRLSの強化。
-- LPと同じSupabaseプロジェクトに受講生もログインするようになるため、
-- 「認証済みなら申込データを読める」ままだと受講生から申込者の個人情報が見えてしまう。
-- 閲覧・更新を管理者（profiles.role = 'admin'）に限定する。
--
-- 実行順序：career-app/supabase/migrations/0001_career_app_schema.sql を先に実行すること
-- （profiles テーブルと is_admin() 関数を利用するため）

drop policy if exists "authenticated_can_select_applications" on public.applications;
drop policy if exists "authenticated_can_update_applications" on public.applications;

create policy "admin_can_select_applications"
  on public.applications
  for select
  to authenticated
  using (public.is_admin());

create policy "admin_can_update_applications"
  on public.applications
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
