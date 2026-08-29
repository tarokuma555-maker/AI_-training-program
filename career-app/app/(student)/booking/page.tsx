import Icon from "@/components/ui/Icon";
import { BookButton, CancelButton } from "@/components/rooms/BookingButtons";
import { SLOT_KIND_LABELS } from "@/lib/constants";
import { formatSlot } from "@/lib/format";
import { requireProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LessonSlot } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const profile = await requireProfile();
  const supabase = createSupabaseServerClient();
  const now = new Date();
  const nowIso = now.toISOString();

  const [{ data: slotRows }, { data: countRows }, { data: bookingRows }] =
    await Promise.all([
      supabase
        .from("lesson_slots")
        .select("*")
        .gt("starts_at", nowIso)
        .order("starts_at"),
      supabase.rpc("slot_booked_counts"),
      supabase
        .from("bookings")
        .select("id, status, slot:lesson_slots!inner(*)")
        .eq("student_id", profile.id)
        .eq("status", "booked"),
    ]);

  const slots = (slotRows ?? []) as LessonSlot[];
  const counts = new Map<string, number>(
    ((countRows ?? []) as { slot_id: string; booked_count: number }[]).map(
      (r) => [r.slot_id, Number(r.booked_count)]
    )
  );
  const myBookings = (bookingRows ?? []).map((b) => ({
    id: b.id as string,
    slot: b.slot as unknown as LessonSlot,
  }));
  const mySlotIds = new Set(myBookings.map((b) => b.slot.id));
  const upcoming = myBookings
    .filter((b) => new Date(b.slot.starts_at) > now)
    .sort((a, b) => a.slot.starts_at.localeCompare(b.slot.starts_at));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold">予約室</h1>
        <p className="mt-1 text-xs text-navy/60">
          個別面談（週次面談）の予約ができます。キャンセルは開始24時間前まで可能です。
        </p>
      </div>

      {/* 自分の予約 */}
      <section>
        <h2 className="text-sm font-bold">あなたの予約</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-white p-5 text-sm text-navy/60">
            予約はまだありません。下の空き枠から予約してください。
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {upcoming.map((b) => {
              const cancellable =
                new Date(b.slot.starts_at).getTime() - now.getTime() >
                24 * 60 * 60 * 1000;
              return (
                <li
                  key={b.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal text-white">
                    <Icon name="cal" className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-sm">
                    <span className="block font-bold">
                      {formatSlot(b.slot.starts_at)}
                    </span>
                    <span className="text-xs text-navy/60">
                      {SLOT_KIND_LABELS[b.slot.kind]}
                      {b.slot.note ? `・${b.slot.note}` : ""}
                    </span>
                  </span>
                  {cancellable ? (
                    <CancelButton bookingId={b.id} />
                  ) : (
                    <span className="text-xs text-navy/50">
                      24時間前を過ぎたため
                      <br />
                      変更は運営者まで
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 空き枠 */}
      <section>
        <h2 className="text-sm font-bold">空き枠</h2>
        {slots.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-white p-5 text-sm text-navy/60">
            予約できる枠はまだありません。
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {slots.map((slot) => {
              const booked = counts.get(slot.id) ?? 0;
              const mine = mySlotIds.has(slot.id);
              const full = booked >= slot.capacity;
              return (
                <li
                  key={slot.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4"
                >
                  <span className="flex-1 text-sm">
                    <span className="block font-bold">
                      {formatSlot(slot.starts_at)}
                    </span>
                    <span className="text-xs text-navy/60">
                      {SLOT_KIND_LABELS[slot.kind]}
                      {slot.note ? `・${slot.note}` : ""}
                    </span>
                  </span>
                  {mine ? (
                    <span className="rounded-full bg-teal/15 px-3 py-1 text-xs font-bold text-teal">
                      予約済み
                    </span>
                  ) : full ? (
                    <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-bold text-navy/50">
                      満席
                    </span>
                  ) : (
                    <BookButton slotId={slot.id} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
