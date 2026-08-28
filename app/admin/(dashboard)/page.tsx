import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { TRACK_LABELS } from "@/lib/applications";
import { formatDateTime, type ApplicationRow } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import AiVerdictView from "@/components/admin/AiVerdictView";

export const dynamic = "force-dynamic";

export default async function AdminListPage() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, created_at, name, desired_track, status, ai_verdict, ai_recommendation"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        申込一覧の取得に失敗しました：{error.message}
      </p>
    );
  }

  const applications = (data ?? []) as Pick<
    ApplicationRow,
    | "id"
    | "created_at"
    | "name"
    | "desired_track"
    | "status"
    | "ai_verdict"
    | "ai_recommendation"
  >[];

  return (
    <div>
      <h1 className="text-xl font-bold">申込一覧</h1>
      <p className="mt-1 text-sm text-navy/60">
        AI判定は一次判定です。最終判断は各申込の詳細画面で行ってください。
      </p>

      {applications.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-8 text-center text-sm text-navy/50">
          申込はまだありません。
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-xs text-navy/60">
                <th className="px-4 py-3 font-medium">日時</th>
                <th className="px-4 py-3 font-medium">氏名</th>
                <th className="px-4 py-3 font-medium">希望</th>
                <th className="px-4 py-3 font-medium">AI判定結果と理由</th>
                <th className="px-4 py-3 font-medium">ステータス</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-navy/5 align-top last:border-b-0 hover:bg-base/50"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-navy/70">
                    {formatDateTime(app.created_at)}
                  </td>
                  <td className="px-4 py-4 font-medium">{app.name}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs">
                    {TRACK_LABELS[app.desired_track] ?? app.desired_track}
                  </td>
                  <td className="max-w-md px-4 py-4">
                    <AiVerdictView
                      verdict={app.ai_verdict}
                      recommendation={app.ai_recommendation}
                      compact
                    />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/${app.id}`}
                      className="whitespace-nowrap text-xs font-bold text-teal underline hover:opacity-80"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
