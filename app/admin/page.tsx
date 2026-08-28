import Link from "next/link";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import { desireLabel } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";

export const dynamic = "force-dynamic";

function aiSummary(app: Application): string {
  if (!app.ai_verdict) return "未判定";
  const items = [
    app.ai_verdict.target_job_specific,
    app.ai_verdict.judgment_experience,
    app.ai_verdict.schedule_realistic,
  ];
  return items
    .map((item) => `${item.verdict === "YES" ? "○" : "×"} ${item.reason}`)
    .join("　");
}

export default async function AdminListPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-navy/70">
        申込一覧の取得に失敗しました：{error.message}
      </p>
    );
  }

  const applications = (data ?? []) as Application[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">申込一覧</h1>
        <p className="text-sm text-navy/60">{applications.length}件</p>
      </div>

      {applications.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-navy/60">
          まだ申込はありません。
        </p>
      ) : (
        <>
          {/* PC: テーブル表示 */}
          <div className="mt-6 hidden overflow-x-auto rounded-2xl bg-white sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-xs text-navy/60">
                  <th className="px-4 py-3 font-bold">日時</th>
                  <th className="px-4 py-3 font-bold">氏名</th>
                  <th className="px-4 py-3 font-bold">希望</th>
                  <th className="px-4 py-3 font-bold">AI一次判定</th>
                  <th className="px-4 py-3 font-bold">status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-navy/5 last:border-0 hover:bg-mist/60"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-navy/70">
                      <Link href={`/admin/${app.id}`} className="block">
                        {formatDateTime(app.created_at)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      <Link href={`/admin/${app.id}`} className="block">
                        {app.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {desireLabel(app.desire)}
                    </td>
                    <td className="max-w-md px-4 py-3">
                      {app.ai_recommendation && (
                        <span
                          className={`mr-2 inline-block rounded px-2 py-0.5 text-xs font-bold ${
                            app.ai_recommendation === "pass"
                              ? "bg-teal/15 text-teal"
                              : "bg-accent/15 text-accent"
                          }`}
                        >
                          {app.ai_recommendation}
                        </span>
                      )}
                      <span className="text-xs leading-relaxed text-navy/70">
                        {aiSummary(app)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* スマホ: カード表示 */}
          <ul className="mt-6 space-y-3 sm:hidden">
            {applications.map((app) => (
              <li key={app.id}>
                <Link
                  href={`/admin/${app.id}`}
                  className="block rounded-2xl bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold">{app.name}</p>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="mt-1 text-xs text-navy/60">
                    {formatDateTime(app.created_at)}・{desireLabel(app.desire)}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-navy/70">
                    {app.ai_recommendation && (
                      <span className="mr-1 font-bold">
                        [{app.ai_recommendation}]
                      </span>
                    )}
                    {aiSummary(app)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
