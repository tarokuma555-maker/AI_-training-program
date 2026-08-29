import LogoutButton from "@/components/auth/LogoutButton";
import { ATTENDANCE_LABELS, TRACK_LABELS } from "@/lib/constants";
import { requireProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const profile = await requireProfile();
  const supabase = createSupabaseServerClient();

  const [{ data: attRows }, { data: subRows }, { data: asgRows }] =
    await Promise.all([
      supabase
        .from("attendance")
        .select("status")
        .eq("student_id", profile.id),
      supabase
        .from("submissions")
        .select("id")
        .eq("student_id", profile.id),
      supabase.from("assignments").select("id"),
    ]);

  const attCounts: Record<string, number> = {};
  for (const row of attRows ?? []) {
    attCounts[row.status as string] = (attCounts[row.status as string] ?? 0) + 1;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold">マイページ</h1>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-sm font-bold text-navy/60">登録情報</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy/60">氏名</dt>
            <dd className="font-bold">{profile.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/60">トラック</dt>
            <dd className="font-bold">
              {profile.track ? TRACK_LABELS[profile.track] : "−"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/60">期</dt>
            <dd className="font-bold">{profile.cohort ?? "−"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-sm font-bold text-navy/60">出席の記録</h2>
        {Object.keys(attCounts).length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">まだ記録はありません。</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {Object.entries(attCounts).map(([status, count]) => (
              <li
                key={status}
                className="rounded-full bg-mist px-4 py-1.5 text-sm"
              >
                {ATTENDANCE_LABELS[status] ?? status}：
                <span className="font-bold">{count}回</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-sm font-bold text-navy/60">課題の提出</h2>
        <p className="mt-3 text-sm">
          公開中の課題 {(asgRows ?? []).length} 件のうち、
          <span className="font-bold">{(subRows ?? []).length} 件</span>
          を提出済みです。
        </p>
      </section>

      <div className="pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}
