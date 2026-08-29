"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/adminGuard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: boolean; message: string };

export async function createAssignment(input: {
  week_id: string;
  title: string;
  description: string;
  due_at: string;
  track: string;
}): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };
  if (!input.week_id) return { ok: false, message: "週を選択してください。" };
  if (!input.title.trim()) return { ok: false, message: "タイトルを入力してください。" };
  if (!input.description.trim()) return { ok: false, message: "説明を入力してください。" };
  if (!input.due_at) return { ok: false, message: "締切を指定してください。" };
  if (!["common", "career", "skill"].includes(input.track)) {
    return { ok: false, message: "対象トラックが不正です。" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("assignments").insert({
    week_id: input.week_id,
    title: input.title.trim(),
    description: input.description.trim(),
    due_at: input.due_at,
    track: input.track,
  });
  if (error) return { ok: false, message: `作成に失敗しました：${error.message}` };

  revalidatePath("/admin/assignments");
  revalidatePath("/assignments");
  revalidatePath("/");
  return { ok: true, message: "課題を作成しました。" };
}

/** 提出への講師コメント（1提出につき1つ・上書き） */
export async function commentSubmission(
  submissionId: string,
  comment: string
): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("submissions")
    .update({ admin_comment: comment.trim() || null })
    .eq("id", submissionId);
  if (error) return { ok: false, message: `保存に失敗しました：${error.message}` };

  revalidatePath("/admin/assignments");
  return { ok: true, message: "コメントを保存しました。" };
}
