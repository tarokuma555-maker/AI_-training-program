-- Storageバケットとポリシー
-- materials   : 教材（PDF・テンプレ）。書き込みはadminのみ。受講生の閲覧は署名付きURL（サーバー発行）のみ
-- submissions : 課題の添付。受講生は自分のフォルダ（{student_id}/...）のみ読み書き

insert into storage.buckets (id, name, public)
values ('materials', 'materials', false), ('submissions', 'submissions', false)
on conflict (id) do nothing;

create policy "materials_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'materials' and public.is_admin())
  with check (bucket_id = 'materials' and public.is_admin());

create policy "submissions_student_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'submissions'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "submissions_student_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
