import StudentForm from "@/components/admin/StudentForm";
import { TRACK_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });
  const students = (data ?? []) as Profile[];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5">
        <h1 className="text-base font-bold">受講生の登録（招待制）</h1>
        <p className="mt-1 text-xs text-navy/60">
          登録するとログイン可能になります。アプリのURLとログイン方法（メールアドレスでリンクを受け取る）をLINE等で案内してください。
        </p>
        <div className="mt-4">
          <StudentForm defaultCohort="2026-1" />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-base font-bold">受講生一覧（{students.length}名）</h2>
        {students.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">まだ登録がありません。</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-xs text-navy/60">
                  <th className="px-3 py-2 font-bold">氏名</th>
                  <th className="px-3 py-2 font-bold">メール</th>
                  <th className="px-3 py-2 font-bold">トラック</th>
                  <th className="px-3 py-2 font-bold">期</th>
                  <th className="px-3 py-2 font-bold">登録日</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-navy/5 last:border-0">
                    <td className="px-3 py-2 font-bold">{s.name}</td>
                    <td className="px-3 py-2">{s.email}</td>
                    <td className="px-3 py-2">
                      {s.track ? TRACK_LABELS[s.track] : "−"}
                    </td>
                    <td className="px-3 py-2">{s.cohort ?? "−"}</td>
                    <td className="px-3 py-2 text-navy/60">
                      {formatDate(s.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
