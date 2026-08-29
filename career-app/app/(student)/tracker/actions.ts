"use server";

import { revalidatePath } from "next/cache";
import { JOB_STATUS_ORDER } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: boolean; message: string };

/** 転職トラックの受講生本人かを確認する */
async function verifyCareerStudent(): Promise<{ id: string } | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("track")
    .eq("id", user.id)
    .maybeSingle();
  return data?.track === "career" ? { id: user.id } : null;
}

export async function addJobApplication(input: {
  company: string;
  applied_on: string;
  channel: string;
  memo: string;
}): Promise<Result> {
  const me = await verifyCareerStudent();
  if (!me) return { ok: false, message: "応募トラッカーは転職トラック専用です。" };
  if (!input.company.trim()) return { ok: false, message: "企業名を入力してください。" };
  if (!input.applied_on) return { ok: false, message: "応募日を入力してください。" };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("job_applications").insert({
    student_id: me.id,
    company: input.company.trim(),
    applied_on: input.applied_on,
    channel: input.channel.trim() || null,
    memo: input.memo.trim() || null,
  });
  if (error) return { ok: false, message: `登録に失敗しました：${error.message}` };
  revalidatePath("/tracker");
  return { ok: true, message: "応募を記録しました。" };
}

export async function updateJobApplication(
  id: string,
  input: { status: string; memo: string }
): Promise<Result> {
  const me = await verifyCareerStudent();
  if (!me) return { ok: false, message: "応募トラッカーは転職トラック専用です。" };
  if (!(JOB_STATUS_ORDER as readonly string[]).includes(input.status)) {
    return { ok: false, message: "ステータスが不正です。" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("job_applications")
    .update({
      status: input.status,
      memo: input.memo.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, message: `更新に失敗しました：${error.message}` };
  revalidatePath("/tracker");
  return { ok: true, message: "更新しました。" };
}

export async function deleteJobApplication(id: string): Promise<Result> {
  const me = await verifyCareerStudent();
  if (!me) return { ok: false, message: "応募トラッカーは転職トラック専用です。" };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("job_applications").delete().eq("id", id);
  if (error) return { ok: false, message: `削除に失敗しました：${error.message}` };
  revalidatePath("/tracker");
  return { ok: true, message: "削除しました。" };
}
