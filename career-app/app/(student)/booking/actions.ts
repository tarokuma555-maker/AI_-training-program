"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: boolean; message: string };

const ERROR_MESSAGES: Record<string, string> = {
  slot_not_found: "この枠は見つかりませんでした。",
  slot_started: "この枠はすでに開始しています。",
  slot_full: "この枠は満席です。別の枠をお選びください。",
  booking_not_found: "予約が見つかりませんでした。",
  cancel_deadline_passed:
    "開始24時間前を過ぎているためキャンセルできません。運営者にご連絡ください。",
};

function toMessage(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  for (const [key, msg] of Object.entries(ERROR_MESSAGES)) {
    if (raw.includes(key)) return msg;
  }
  // 二重予約はunique index違反として返る
  if (raw.includes("bookings_active_uniq") || raw.includes("duplicate")) {
    return "この枠はすでに予約済みです。";
  }
  return fallback;
}

export async function bookSlot(slotId: string): Promise<Result> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ログインが必要です。" };

  const { error } = await supabase.rpc("book_slot", { p_slot_id: slotId });
  if (error) {
    return { ok: false, message: toMessage(error.message, "予約に失敗しました。") };
  }
  revalidatePath("/booking");
  revalidatePath("/");
  return { ok: true, message: "予約しました。" };
}

export async function cancelBooking(bookingId: string): Promise<Result> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ログインが必要です。" };

  const { error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
  });
  if (error) {
    return {
      ok: false,
      message: toMessage(error.message, "キャンセルに失敗しました。"),
    };
  }
  revalidatePath("/booking");
  revalidatePath("/");
  return { ok: true, message: "キャンセルしました。" };
}
