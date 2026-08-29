"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: boolean; message: string };

/** 課題を提出する（再提出は同一行の上書き） */
export async function submitAssignment(input: {
  assignmentId: string;
  body: string;
  storagePath?: string;
}): Promise<Result> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ログインが必要です。" };

  const body = input.body.trim();
  if (!body && !input.storagePath) {
    return { ok: false, message: "本文を入力するか、ファイルを添付してください。" };
  }
  if (body.length > 10000) {
    return { ok: false, message: "本文は10,000文字以内で入力してください。" };
  }

  // RLSにより自分の行しか書けない。課題が見えるか（公開済みか）もRLSで担保される
  const { data: assignment } = await supabase
    .from("assignments")
    .select("id")
    .eq("id", input.assignmentId)
    .maybeSingle();
  if (!assignment) {
    return { ok: false, message: "この課題は提出できません。" };
  }

  const { error } = await supabase.from("submissions").upsert(
    {
      assignment_id: input.assignmentId,
      student_id: user.id,
      body: body || null,
      storage_path: input.storagePath ?? null,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "assignment_id,student_id" }
  );
  if (error) return { ok: false, message: `提出に失敗しました：${error.message}` };

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${input.assignmentId}`);
  revalidatePath("/");
  return { ok: true, message: "提出しました。" };
}
