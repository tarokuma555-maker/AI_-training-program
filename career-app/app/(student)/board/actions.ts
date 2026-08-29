"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/** 表示したお知らせを既読にする（重複はunique制約で無視） */
export async function markAnnouncementsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("announcement_reads").upsert(
    ids.map((id) => ({ announcement_id: id, student_id: user.id })),
    { onConflict: "announcement_id,student_id", ignoreDuplicates: true }
  );
}
