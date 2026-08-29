import AnnouncementForm from "@/components/admin/AnnouncementForm";
import DeleteAnnouncementButton from "@/components/admin/DeleteAnnouncementButton";
import { TRACK_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Announcement } from "@/lib/types";

export const dynamic = "force-dynamic";

function targetLabel(a: Announcement): string {
  if (a.target === "track" && a.target_track) {
    return TRACK_LABELS[a.target_track];
  }
  if (a.target === "cohort" && a.target_cohort) {
    return `${a.target_cohort}期`;
  }
  return "全体";
}

export default async function AdminAnnouncementsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("published_at", { ascending: false });
  const announcements = (data ?? []) as Announcement[];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5">
        <h1 className="text-base font-bold">お知らせの配信</h1>
        <div className="mt-4">
          <AnnouncementForm />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-base font-bold">配信済み（{announcements.length}件）</h2>
        {announcements.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">まだありません。</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy/5">
            {announcements.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-mist px-3 py-0.5 text-xs font-bold text-navy/60">
                    {targetLabel(a)}
                  </span>
                  <p className="flex-1 text-sm font-bold">{a.title}</p>
                  <DeleteAnnouncementButton id={a.id} />
                </div>
                <p className="mt-1 text-xs text-navy/50">
                  {formatDateTime(a.published_at)}
                </p>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-navy/70">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
