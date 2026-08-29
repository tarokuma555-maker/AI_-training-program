"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CreateStudentInput {
  name: string;
  email: string;
  track: string;
  cohort: string;
}

/** adminか検証する（server action内ではredirectせず結果を返す） */
async function verifyAdmin(): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.role === "admin";
}

/** 受講生を登録する：Authユーザー作成＋profiles insert（招待制の入口） */
export async function createStudent(
  input: CreateStudentInput
): Promise<{ ok: boolean; message: string }> {
  if (!(await verifyAdmin())) {
    return { ok: false, message: "管理者権限が必要です。" };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const { track, cohort } = input;
  if (!name || name.length > 100) {
    return { ok: false, message: "氏名を入力してください。" };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "メールアドレスの形式が正しくありません。" };
  }
  if (track !== "career" && track !== "skill") {
    return { ok: false, message: "トラックを選択してください。" };
  }
  if (!cohort.trim()) {
    return { ok: false, message: "期を入力してください。" };
  }

  const service = createServiceRoleClient();
  const { data: created, error: authError } =
    await service.auth.admin.createUser({ email, email_confirm: true });
  if (authError || !created?.user) {
    return {
      ok: false,
      message: `Authユーザーの作成に失敗しました：${authError?.message ?? "不明なエラー"}（既に登録済みの可能性があります）`,
    };
  }

  const { error: profileError } = await service.from("profiles").insert({
    id: created.user.id,
    name,
    email,
    role: "student",
    track,
    cohort: cohort.trim(),
  });
  if (profileError) {
    return {
      ok: false,
      message: `受講生情報の保存に失敗しました：${profileError.message}`,
    };
  }

  revalidatePath("/admin/students");
  return { ok: true, message: `${name} さんを登録しました。ログイン方法を案内してください。` };
}
