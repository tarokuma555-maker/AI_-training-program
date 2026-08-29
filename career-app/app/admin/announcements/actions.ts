"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/adminGuard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: boolean; message: string };

export async function createAnnouncement(input: {
  title: string;
  body: string;
  target: string;
  target_track: string;
  target_cohort: string;
}): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };
  if (!input.title.trim()) return { ok: false, message: "タイトルを入力してください。" };
  if (!input.body.trim()) return { ok: false, message: "本文を入力してください。" };
  if (!["all", "track", "cohort"].includes(input.target)) {
    return { ok: false, message: "配信対象が不正です。" };
  }
  if (input.target === "track" && !["career", "skill"].includes(input.target_track)) {
    return { ok: false, message: "対象トラックを選択してください。" };
  }
  if (input.target === "cohort" && !input.target_cohort.trim()) {
    return { ok: false, message: "対象の期を入力してください。" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("announcements").insert({
    title: input.title.trim(),
    body: input.body.trim(),
    target: input.target,
    target_track: input.target === "track" ? input.target_track : null,
    target_cohort: input.target === "cohort" ? input.target_cohort.trim() : null,
  });
  if (error) return { ok: false, message: `配信に失敗しました：${error.message}` };

  revalidatePath("/admin/announcements");
  revalidatePath("/board");
  revalidatePath("/");
  return { ok: true, message: "お知らせを配信しました。" };
}

export async function deleteAnnouncement(id: string): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { ok: false, message: `削除に失敗しました：${error.message}` };
  revalidatePath("/admin/announcements");
  revalidatePath("/board");
  return { ok: true, message: "お知らせを削除しました。" };
}
