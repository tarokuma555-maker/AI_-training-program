"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

// 管理画面で人間が行う最終判断（承認／見送り／スキル案内）
const REVIEW_STATUSES = ["approved", "waitlist", "skill_route"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export async function reviewApplication(input: {
  id: string;
  status: ReviewStatus;
  reviewerNote: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!REVIEW_STATUSES.includes(input.status)) {
    return { ok: false, message: "不正なステータスです。" };
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "ログインが必要です。" };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      status: input.status,
      reviewed_at: new Date().toISOString(),
      reviewer_note: input.reviewerNote.trim() || null,
    })
    .eq("id", input.id);

  if (error) {
    console.error("ステータス更新に失敗しました:", error);
    return { ok: false, message: "更新に失敗しました。再度お試しください。" };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${input.id}`);
  return { ok: true };
}

export async function signOutAdmin(): Promise<void> {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
