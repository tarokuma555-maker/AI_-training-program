import { JOB_STATUS_LABELS, JOB_STATUS_ORDER } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JobApplication, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

const STALE_MS = 7 * 24 * 60 * 60 * 1000;

export default async function AdminTrackerPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: studentRows }, { data: appRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, cohort")
      .eq("role", "student")
      .eq("track", "career")
      .order("name"),
    supabase.from("job_applications").select("*"),
  ]);
  const students = (studentRows ?? []) as Pick<Profile, "id" | "name" | "cohort">[];
  const apps = (appRows ?? []) as JobApplication[];
  const now = Date.now();

  const rows = students.map((s) => {
    const mine = apps.filter((a) => a.student_id === s.id);
    const lastUpdated = mine.reduce<string | null>(
      (acc, a) => (!acc || a.updated_at > acc ? a.updated_at : acc),
      null
    );
    const statusCounts = new Map<string, number>();
    for (const a of mine) {
      statusCounts.set(a.status, (statusCounts.get(a.status) ?? 0) + 1);
    }
    const zero = mine.length === 0;
    const stale =
      !zero && lastUpdated !== null && now - new Date(lastUpdated).getTime() > STALE_MS;
    return { student: s, count: mine.length, lastUpdated, statusCounts, zero, stale };
  });

  const flagged = rows.filter((r) => r.zero || r.stale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold">応募ダッシュボード（転職トラック）</h1>
        <p className="mt-1 text-xs text-navy/60">
          週次面談の準備用です。「応募0件」「1週間更新なし」の受講生を優先して確認してください。
        </p>
      </div>

      {flagged.length > 0 && (
        <section className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <p className="text-sm font-bold">要フォロー（{flagged.length}名）</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {flagged.map((r) => (
              <li
                key={r.student.id}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-bold"
              >
                {r.student.name}
                <span className="ml-1 text-xs font-normal text-accent">
                  {r.zero ? "応募0件" : "1週間更新なし"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        {rows.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-sm text-navy/60">
            転職トラックの受講生はまだ登録されていません。
          </p>
        )}
        {rows.map((r) => (
          <div
            key={r.student.id}
            className={`rounded-2xl bg-white p-4 ${
              r.zero || r.stale ? "border-l-4 border-accent" : ""
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold">{r.student.name}</p>
              <span className="rounded-full bg-navy px-3 py-0.5 text-xs font-bold text-white">
                {r.count}社
              </span>
              <span className="text-xs text-navy/50">
                最終更新：{r.lastUpdated ? formatDateTime(r.lastUpdated) : "−"}
              </span>
            </div>
            {r.count > 0 && (
              <p className="mt-2 flex flex-wrap gap-2 text-xs">
                {JOB_STATUS_ORDER.filter((s) => r.statusCounts.get(s)).map((s) => (
                  <span key={s} className="rounded-full bg-mist px-3 py-1">
                    {JOB_STATUS_LABELS[s]}：
                    <span className="font-bold">{r.statusCounts.get(s)}</span>
                  </span>
                ))}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
