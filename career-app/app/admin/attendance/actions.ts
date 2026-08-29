"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/adminGuard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: boolean; message: string };

/** 出欠を記録する（status空文字は記録の削除） */
export async function setAttendance(
  weekId: string,
  studentId: string,
  status: string
): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };

  const supabase = createSupabaseServerClient();

  if (!status) {
    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("week_id", weekId)
      .eq("student_id", studentId);
    if (error) return { ok: false, message: `削除に失敗しました：${error.message}` };
  } else {
    if (!["present", "recorded", "absent"].includes(status)) {
      return { ok: false, message: "出欠の値が不正です。" };
    }
    const { error } = await supabase.from("attendance").upsert(
      {
        week_id: weekId,
        student_id: studentId,
        status,
        noted_at: new Date().toISOString(),
      },
      { onConflict: "week_id,student_id" }
    );
    if (error) return { ok: false, message: `保存に失敗しました：${error.message}` };
  }

  revalidatePath("/admin/attendance");
  revalidatePath("/mypage");
  return { ok: true, message: "保存しました。" };
}
