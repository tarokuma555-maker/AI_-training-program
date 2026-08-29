import { redirect } from "next/navigation";
import JobApplicationCard from "@/components/rooms/JobApplicationCard";
import JobApplicationForm from "@/components/rooms/JobApplicationForm";
import { requireProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JobApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const profile = await requireProfile();
  // 応募トラッカーは転職トラック専用（スキルトラックには部屋ごと見せない）
  if (profile.track !== "career") {
    redirect("/menu");
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("job_applications")
    .select("*")
    .eq("student_id", profile.id)
    .order("applied_on", { ascending: false });
  const apps = (data ?? []) as JobApplication[];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">応募トラッカー室</h1>
          <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">
            {apps.length}社
          </span>
        </div>
        <p className="mt-1 text-xs text-navy/60">
          応募したら必ず記録しましょう。週次面談はこの記録をもとに進めます（修了要件：3社以上）。
        </p>
      </div>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="mb-3 text-sm font-bold">応募を記録する</h2>
        <JobApplicationForm />
      </section>

      <section className="space-y-3">
        {apps.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-navy/60">
            まだ記録がありません。最初の応募を記録しましょう。
          </p>
        ) : (
          apps.map((app) => <JobApplicationCard key={app.id} app={app} />)
        )}
      </section>
    </div>
  );
}
