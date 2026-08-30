import Icon from "@/components/ui/Icon";
import LogoutButton from "@/components/auth/LogoutButton";
import RoomHeader from "@/components/rooms/RoomHeader";
import { ATTENDANCE_LABELS, TRACK_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
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
      <RoomHeader icon="user" title="マイページ" en="MY PAGE" />

      {/* 生徒手帳 */}
      <section className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        <div className="flex items-center justify-between bg-navy px-5 py-3 text-white">
          <span className="flex items-center gap-2.5 text-sm font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40">
              <Icon name="book" className="h-3.5 w-3.5" />
            </span>
            生徒手帳
          </span>
          <span className="text-[9px] font-bold tracking-[0.25em] text-white/50">
            STUDENT CARD
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs text-navy/50">氏名</p>
          <p className="text-xl font-bold">{profile.name}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-navy/50">トラック</dt>
              <dd className="font-bold">
                {profile.track ? TRACK_LABELS[profile.track] : "−"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-navy/50">期</dt>
              <dd className="font-bold">{profile.cohort ?? "−"}</dd>
            </div>
            <div>
              <dt className="text-xs text-navy/50">メールアドレス</dt>
              <dd className="break-all font-bold">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-navy/50">入学日</dt>
              <dd className="font-bold">{formatDate(profile.created_at)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-sm font-bold text-navy/60">出席簿</h2>
        {Object.keys(attCounts).length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">まだ記録はありません。</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-3">
            {Object.entries(attCounts).map(([status, count]) => {
              const stampStyle =
                status === "present"
                  ? "border-teal text-teal"
                  : status === "absent"
                    ? "border-accent text-accent"
                    : "border-navy/40 text-navy/60";
              return (
                <li
                  key={status}
                  className={`flex h-16 w-16 -rotate-6 flex-col items-center justify-center rounded-full border-2 text-center ${stampStyle}`}
                >
                  <span className="text-[10px] font-bold">
                    {ATTENDANCE_LABELS[status] ?? status}
                  </span>
                  <span className="text-sm font-bold">{count}回</span>
                </li>
              );
            })}
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
