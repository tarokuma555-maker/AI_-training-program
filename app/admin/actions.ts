"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["approved", "waitlist", "skill_route"] as const;
type DecisionStatus = (typeof ALLOWED_STATUSES)[number];

/**
 * 最終判断（人間による status 変更）。
 * reviewed_at と reviewer_note（任意メモ）をあわせて保存する。
 */
export async function updateApplicationStatus(
  id: string,
  status: string,
  reviewerNote: string
): Promise<{ ok: boolean; message: string }> {
  if (!ALLOWED_STATUSES.includes(status as DecisionStatus)) {
    return { ok: false, message: "不正なstatusです。" };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "ログインが必要です。" };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewer_note: reviewerNote.trim() || null,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: `更新に失敗しました：${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  return { ok: true, message: "statusを更新しました。" };
}
