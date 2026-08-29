import Link from "next/link";
import AssignmentForm from "@/components/admin/AssignmentForm";
import { WEEK_TRACK_LABELS } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Assignment, Profile, Week } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminAssignmentsPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: weekRows }, { data: asgRows }, { data: studentRows }, { data: subRows }] =
    await Promise.all([
      supabase.from("weeks").select("*").order("week_no").order("track"),
      supabase
        .from("assignments")
        .select("*, week:weeks(week_no)")
        .order("due_at"),
      supabase
        .from("profiles")
        .select("id, name, track")
        .eq("role", "student")
        .order("name"),
      supabase.from("submissions").select("id, assignment_id, student_id, admin_comment"),
    ]);

  const weeks = (weekRows ?? []) as Week[];
  const assignments = (asgRows ?? []) as unknown as (Assignment & {
    week: { week_no: number } | null;
  })[];
  const students = (studentRows ?? []) as Pick<Profile, "id" | "name" | "track">[];
  const submissions = (subRows ?? []) as Pick<
    { id: string; assignment_id: string; student_id: string; admin_comment: string | null },
    "id" | "assignment_id" | "student_id" | "admin_comment"
  >[];
  const subMap = new Map(
    submissions.map((s) => [`${s.assignment_id}:${s.student_id}`, s])
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5">
        <h1 className="text-base font-bold">課題の作成</h1>
        {weeks.length === 0 ? (
          <p className="mt-2 text-sm text-navy/60">
            先に「教材」で週を作成してください。
          </p>
        ) : (
          <div className="mt-4">
            <AssignmentForm
              weeks={weeks.map((w) => ({
                id: w.id,
                week_no: w.week_no,
                title: w.title,
                track: w.track,
              }))}
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-base font-bold">提出マトリクス</h2>
        <p className="mt-1 text-xs text-navy/60">
          <span className="mr-3 inline-block rounded bg-accent/15 px-2 py-0.5 font-bold text-accent">未提出</span>
          <span className="mr-3 inline-block rounded bg-teal/15 px-2 py-0.5 font-bold text-teal">提出済み</span>
          <span className="inline-block rounded bg-navy px-2 py-0.5 font-bold text-white">コメント済み</span>
          　セルを押すと提出内容の確認とコメントができます。対象外トラックのセルは「−」。
        </p>
        {assignments.length === 0 || students.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">
            課題と受講生の両方が登録されると表示されます。
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white px-3 py-2 text-xs font-bold text-navy/60">
                    受講生
                  </th>
                  {assignments.map((a) => (
                    <th key={a.id} className="px-2 py-2 text-xs font-bold text-navy/60">
                      {a.week ? `W${a.week.week_no}` : ""}
                      <span className="block max-w-[120px] truncate font-normal">
                        {a.title}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-navy/5">
                    <td className="sticky left-0 bg-white px-3 py-2 font-bold">
                      {s.name}
                    </td>
                    {assignments.map((a) => {
                      const applicable =
                        a.track === "common" || a.track === s.track;
                      if (!applicable) {
                        return (
                          <td key={a.id} className="px-2 py-2 text-navy/30">
                            −
                          </td>
                        );
                      }
                      const sub = subMap.get(`${a.id}:${s.id}`);
                      const cellClass = sub
                        ? sub.admin_comment
                          ? "bg-navy text-white"
                          : "bg-teal/15 text-teal"
                        : "bg-accent/15 text-accent";
                      return (
                        <td key={a.id} className="px-1 py-1">
                          <Link
                            href={`/admin/submissions/${a.id}/${s.id}`}
                            className={`block rounded px-2 py-1.5 text-center text-xs font-bold ${cellClass}`}
                          >
                            {sub ? (sub.admin_comment ? "済" : "提出") : "未"}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-base font-bold">課題一覧</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center gap-2">
              <span className="rounded bg-mist px-2 py-0.5 text-xs font-bold text-navy/60">
                {WEEK_TRACK_LABELS[a.track]}
              </span>
              <span className="font-bold">{a.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
