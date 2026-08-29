"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/adminGuard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: boolean; message: string };

function revalidate() {
  revalidatePath("/admin/slots");
  revalidatePath("/booking");
  revalidatePath("/");
}

export async function createSlot(input: {
  starts_at: string;
  duration_minutes: number;
  capacity: number;
  track: string; // "" = 全トラック
  cohort: string; // "" = 全期
  note: string;
}): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };
  if (!input.starts_at) return { ok: false, message: "開始日時を指定してください。" };
  const starts = new Date(input.starts_at);
  if (Number.isNaN(starts.getTime()) || starts <= new Date()) {
    return { ok: false, message: "開始日時は未来の日時を指定してください。" };
  }
  const minutes = Number(input.duration_minutes);
  if (!Number.isInteger(minutes) || minutes < 10 || minutes > 240) {
    return { ok: false, message: "所要時間は10〜240分で指定してください。" };
  }
  const capacity = Number(input.capacity);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
    return { ok: false, message: "定員は1〜100で指定してください。" };
  }
  if (input.track && input.track !== "career" && input.track !== "skill") {
    return { ok: false, message: "対象トラックが不正です。" };
  }

  const ends = new Date(starts.getTime() + minutes * 60 * 1000);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("lesson_slots").insert({
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    kind: "meeting", // 第1期は個別面談のみ
    capacity,
    track: input.track || null,
    cohort: input.cohort.trim() || null,
    note: input.note.trim() || null,
  });
  if (error) return { ok: false, message: `作成に失敗しました：${error.message}` };
  revalidate();
  return { ok: true, message: "面談枠を作成しました。" };
}

export async function deleteSlot(id: string): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("lesson_slots").delete().eq("id", id);
  if (error) return { ok: false, message: `削除に失敗しました：${error.message}` };
  revalidate();
  return { ok: true, message: "面談枠を削除しました（予約も同時に消えます）。" };
}
