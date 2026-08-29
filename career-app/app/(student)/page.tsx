import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { formatDateTime, formatSlot } from "@/lib/format";
import { requireProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SLOT_KIND_LABELS } from "@/lib/constants";
import type { Assignment, LessonSlot, Week } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = await requireProfile();
  const supabase = createSupabaseServerClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const in72hIso = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

  // 今週＝公開済みの最新週
  const { data: weekRows } = await supabase
    .from("weeks")
    .select("*")
    .lte("publish_at", nowIso)
    .order("week_no", { ascending: false })
    .limit(1);
  const week = (weekRows?.[0] ?? null) as Week | null;

  // 今週の課題＋自分の提出状況
  let weekAssignments: (Assignment & { submitted: boolean })[] = [];
  if (week) {
    const { data: asgRows } = await supabase
      .from("assignments")
      .select("*")
      .eq("week_id", week.id)
      .order("due_at");
    const asgs = (asgRows ?? []) as Assignment[];
    const submitted = await fetchSubmittedSet(
      supabase,
      profile.id,
      asgs.map((a) => a.id)
    );
    weekAssignments = asgs.map((a) => ({ ...a, submitted: submitted.has(a.id) }));
  }

  // 締切72時間以内・未提出の課題
  const { data: dueRows } = await supabase
    .from("assignments")
    .select("id, title, due_at")
    .gt("due_at", nowIso)
    .lte("due_at", in72hIso)
    .order("due_at");
  const dueList = (dueRows ?? []) as Pick<Assignment, "id" | "title" | "due_at">[];
  const dueSubmitted = await fetchSubmittedSet(
    supabase,
    profile.id,
    dueList.map((a) => a.id)
  );
  const dueSoon = dueList.filter((a) => !dueSubmitted.has(a.id));

  // 未読お知らせ数
  const { data: annRows } = await supabase.from("announcements").select("id");
  const { data: readRows } = await supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("student_id", profile.id);
  const readSet = new Set((readRows ?? []).map((r) => r.announcement_id as string));
  const unreadCount = (annRows ?? []).filter((a) => !readSet.has(a.id as string)).length;

  // 次の予約
  const { data: bookingRows } = await supabase
    .from("bookings")
    .select("id, status, slot:lesson_slots!inner(*)")
    .eq("student_id", profile.id)
    .eq("status", "booked");
  const nextBooking =
    (bookingRows ?? [])
      .map((b) => ({ id: b.id as string, slot: b.slot as unknown as LessonSlot }))
      .filter((b) => new Date(b.slot.starts_at) > now)
      .sort((a, b) => a.slot.starts_at.localeCompare(b.slot.starts_at))[0] ?? null;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold">こんにちは、{profile.name}さん</h1>

      {/* 今週カード */}
      {week ? (
        <section className="rounded-2xl bg-navy p-5 text-white">
          <p className="text-xs font-bold text-white/60">今週</p>
          <h2 className="mt-1 text-lg font-bold">
            第{week.week_no}週　{week.title}
          </h2>
          {week.goal && (
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {week.goal}
            </p>
          )}
          {weekAssignments.length > 0 && (
            <ul className="mt-4 space-y-2">
              {weekAssignments.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/assignments/${a.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm"
                  >
                    <span className="font-bold">{a.title}</span>
                    <span className="shrink-0 text-xs text-white/70">
                      {a.submitted ? "提出済み" : `締切 ${formatDateTime(a.due_at)}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/library"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-bold text-white"
          >
            <Icon name="book" className="h-4 w-4" />
            今週の教材へ
          </Link>
        </section>
      ) : (
        <section className="rounded-2xl bg-white p-5 text-sm text-navy/60">
          公開中の週はまだありません。開講までお待ちください。
        </section>
      )}

      {/* 締切アラート */}
      {dueSoon.length > 0 && (
        <section className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Icon name="clock" className="h-4 w-4 text-accent" />
            締切が近い課題
          </p>
          <ul className="mt-2 space-y-1">
            {dueSoon.map((a) => (
              <li key={a.id} className="text-sm">
                <Link href={`/assignments/${a.id}`} className="underline underline-offset-4">
                  {a.title}
                </Link>
                <span className="ml-2 text-xs text-navy/60">
                  締切 {formatDateTime(a.due_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* お知らせ・予約 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/board"
          className="flex items-center gap-3 rounded-2xl bg-white p-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
            <Icon name="bell" className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold">お知らせ</span>
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white">
              未読{unreadCount}
            </span>
          )}
        </Link>
        <Link
          href="/booking"
          className="flex items-center gap-3 rounded-2xl bg-white p-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
            <Icon name="cal" className="h-5 w-5" />
          </span>
          {nextBooking ? (
            <span className="text-sm">
              <span className="block text-xs text-navy/60">次の予約</span>
              <span className="font-bold">
                {formatSlot(nextBooking.slot.starts_at)}（
                {SLOT_KIND_LABELS[nextBooking.slot.kind]}）
              </span>
            </span>
          ) : (
            <span className="text-sm font-bold">面談を予約する</span>
          )}
        </Link>
      </div>
    </div>
  );
}

async function fetchSubmittedSet(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  studentId: string,
  assignmentIds: string[]
): Promise<Set<string>> {
  if (assignmentIds.length === 0) return new Set();
  const { data } = await supabase
    .from("submissions")
    .select("assignment_id")
    .eq("student_id", studentId)
    .in("assignment_id", assignmentIds);
  return new Set((data ?? []).map((s) => s.assignment_id as string));
}
