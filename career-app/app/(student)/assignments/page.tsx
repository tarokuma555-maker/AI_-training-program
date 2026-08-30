import Link from "next/link";
import RoomHeader from "@/components/rooms/RoomHeader";
import { formatDateTime } from "@/lib/format";
import { requireProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Assignment } from "@/lib/types";

export const dynamic = "force-dynamic";

interface AssignmentRow extends Assignment {
  week: { week_no: number; title: string } | null;
}

export default async function AssignmentsPage() {
  const profile = await requireProfile();
  const supabase = createSupabaseServerClient();

  const [{ data: asgRows }, { data: subRows }] = await Promise.all([
    supabase
      .from("assignments")
      .select("*, week:weeks(week_no, title)")
      .order("due_at"),
    supabase
      .from("submissions")
      .select("assignment_id, admin_comment")
      .eq("student_id", profile.id),
  ]);

  const assignments = (asgRows ?? []) as unknown as AssignmentRow[];
  const submissionMap = new Map(
    (subRows ?? []).map((s) => [
      s.assignment_id as string,
      { hasComment: Boolean(s.admin_comment) },
    ])
  );
  const now = new Date();

  return (
    <div>
      <RoomHeader icon="pencil" title="課題提出室" en="ASSIGNMENTS" />
      {assignments.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white p-6 text-sm text-navy/60">
          公開中の課題はまだありません。
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {assignments.map((a) => {
            const sub = submissionMap.get(a.id);
            const overdue = !sub && new Date(a.due_at) < now;
            return (
              <li key={a.id}>
                <Link
                  href={`/assignments/${a.id}`}
                  className="block rounded-2xl bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold">{a.title}</p>
                    {sub ? (
                      // 提出済みはハンコ風（講師コメントが付くと「講評」印になる）
                      <span
                        className={`flex h-10 w-10 shrink-0 -rotate-12 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          sub.hasComment
                            ? "border-accent text-accent"
                            : "border-teal text-teal"
                        }`}
                      >
                        {sub.hasComment ? "講評" : "済"}
                      </span>
                    ) : (
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          overdue
                            ? "bg-accent/15 text-accent"
                            : "bg-navy/10 text-navy/60"
                        }`}
                      >
                        {overdue ? "締切超過" : "未提出"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-navy/60">
                    {a.week ? `第${a.week.week_no}週` : ""}・締切{" "}
                    {formatDateTime(a.due_at)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
