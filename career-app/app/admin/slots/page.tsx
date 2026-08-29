import DeleteSlotButton from "@/components/admin/DeleteSlotButton";
import SlotForm from "@/components/admin/SlotForm";
import { SLOT_KIND_LABELS, TRACK_LABELS } from "@/lib/constants";
import { formatSlot } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LessonSlot, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

interface SlotWithBookings extends LessonSlot {
  bookings: { id: string; status: string; student: { name: string } | null }[];
}

export default async function AdminSlotsPage() {
  const supabase = createSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const [{ data: slotRows }, { data: studentRows }, { data: futureBookingRows }] =
    await Promise.all([
      supabase
        .from("lesson_slots")
        .select("*, bookings(id, status, student:profiles(name))")
        .order("starts_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, name, track, cohort")
        .eq("role", "student")
        .order("name"),
      supabase
        .from("bookings")
        .select("student_id, slot:lesson_slots!inner(starts_at)")
        .eq("status", "booked")
        .gt("slot.starts_at", nowIso),
    ]);

  const slots = (slotRows ?? []) as unknown as SlotWithBookings[];
  const students = (studentRows ?? []) as Pick<
    Profile,
    "id" | "name" | "track" | "cohort"
  >[];
  const bookedStudentIds = new Set(
    (futureBookingRows ?? []).map((b) => b.student_id as string)
  );
  const notBooked = students.filter((s) => !bookedStudentIds.has(s.id));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5">
        <h1 className="text-base font-bold">面談枠の作成</h1>
        <div className="mt-4">
          <SlotForm />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-base font-bold">今後の予約がない受講生（{notBooked.length}名）</h2>
        {notBooked.length === 0 ? (
          <p className="mt-2 text-sm text-navy/60">全員に今後の予約があります。</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {notBooked.map((s) => (
              <li
                key={s.id}
                className="rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-navy"
              >
                {s.name}
                <span className="ml-1 text-xs font-normal text-navy/60">
                  {s.track ? TRACK_LABELS[s.track] : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold">枠一覧</h2>
        {slots.length === 0 && (
          <p className="rounded-2xl bg-white p-5 text-sm text-navy/60">
            まだ枠がありません。
          </p>
        )}
        {slots.map((slot) => {
          const booked = slot.bookings.filter((b) => b.status === "booked");
          const past = new Date(slot.starts_at) <= new Date();
          return (
            <div
              key={slot.id}
              className={`rounded-2xl bg-white p-4 ${past ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-bold">{formatSlot(slot.starts_at)}</p>
                <span className="rounded-full bg-mist px-3 py-0.5 text-xs font-bold text-navy/60">
                  {SLOT_KIND_LABELS[slot.kind]}・定員{slot.capacity}
                </span>
                {slot.track && (
                  <span className="rounded-full bg-mist px-3 py-0.5 text-xs text-navy/60">
                    {TRACK_LABELS[slot.track]}
                  </span>
                )}
                {slot.cohort && (
                  <span className="rounded-full bg-mist px-3 py-0.5 text-xs text-navy/60">
                    {slot.cohort}
                  </span>
                )}
                <span className="ml-auto">
                  <DeleteSlotButton slotId={slot.id} />
                </span>
              </div>
              <p className="mt-2 text-sm">
                予約：
                {booked.length === 0 ? (
                  <span className="text-navy/50">なし</span>
                ) : (
                  <span className="font-bold">
                    {booked.map((b) => b.student?.name ?? "不明").join("、")}
                  </span>
                )}
                <span className="ml-2 text-xs text-navy/50">
                  （{booked.length}/{slot.capacity}）
                </span>
              </p>
              {slot.note && (
                <p className="mt-1 text-xs text-navy/60">{slot.note}</p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
