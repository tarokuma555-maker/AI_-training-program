import AttendanceCell from "@/components/admin/AttendanceCell";
import { WEEK_TRACK_LABELS } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Attendance, Profile, Week } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const supabase = createSupabaseServerClient();
  const [{ data: weekRows }, { data: studentRows }, { data: attRows }] =
    await Promise.all([
      supabase.from("weeks").select("*").order("week_no").order("track"),
      supabase
        .from("profiles")
        .select("id, name, track")
        .eq("role", "student")
        .order("name"),
      supabase.from("attendance").select("*"),
    ]);
  const weeks = (weekRows ?? []) as Week[];
  const students = (studentRows ?? []) as Pick<Profile, "id" | "name" | "track">[];
  const attendance = (attRows ?? []) as Attendance[];
  const attMap = new Map(
    attendance.map((a) => [`${a.week_id}:${a.student_id}`, a.status as string])
  );
  const absentCount = new Map<string, number>();
  for (const a of attendance) {
    if (a.status === "absent") {
      absentCount.set(a.student_id, (absentCount.get(a.student_id) ?? 0) + 1);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5">
      <h1 className="text-base font-bold">出欠記録</h1>
      <p className="mt-1 text-xs text-navy/60">
        無断欠席（録画補講なしの欠席）が2回以上の受講生は行が強調されます。
      </p>
      {weeks.length === 0 || students.length === 0 ? (
        <p className="mt-3 text-sm text-navy/60">
          週と受講生の両方が登録されると表示されます。
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white px-3 py-2 text-xs font-bold text-navy/60">
                  受講生
                </th>
                {weeks.map((w) => (
                  <th key={w.id} className="px-2 py-2 text-center text-xs font-bold text-navy/60">
                    第{w.week_no}週
                    <span className="block font-normal">
                      {WEEK_TRACK_LABELS[w.track]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const absents = absentCount.get(s.id) ?? 0;
                return (
                  <tr
                    key={s.id}
                    className={`border-t border-navy/5 ${
                      absents >= 2 ? "bg-accent/10" : ""
                    }`}
                  >
                    <td className="sticky left-0 bg-inherit px-3 py-2 font-bold">
                      {s.name}
                      {absents >= 2 && (
                        <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                          無断欠席{absents}回
                        </span>
                      )}
                    </td>
                    {weeks.map((w) => {
                      const applicable =
                        w.track === "common" || w.track === s.track;
                      if (!applicable) {
                        return (
                          <td key={w.id} className="px-2 py-2 text-center text-navy/30">
                            −
                          </td>
                        );
                      }
                      return (
                        <td key={w.id} className="px-1 py-1.5">
                          <AttendanceCell
                            weekId={w.id}
                            studentId={s.id}
                            current={attMap.get(`${w.id}:${s.id}`) ?? ""}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
