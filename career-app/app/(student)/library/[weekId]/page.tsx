import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/ui/Icon";
import MaterialLink from "@/components/rooms/MaterialLink";
import { formatDate } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { Material, Week } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WeekPage({
  params,
}: {
  params: { weekId: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: weekData } = await supabase
    .from("weeks")
    .select("*")
    .eq("id", params.weekId)
    .maybeSingle();
  if (!weekData) notFound();
  const week = weekData as Week;

  const locked = new Date(week.publish_at) > new Date();
  if (locked) {
    return (
      <div>
        <BackLink />
        <div className="mt-4 rounded-2xl bg-white p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy/10 text-navy/50">
            <Icon name="lock" className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-bold">
            第{week.week_no}週は {formatDate(week.publish_at)} に公開予定です
          </p>
        </div>
      </div>
    );
  }

  const { data: materialData } = await supabase
    .from("materials")
    .select("*")
    .eq("week_id", week.id)
    .order("sort_order")
    .order("created_at");
  const materials = (materialData ?? []) as Material[];

  const videos = materials.filter((m) => m.kind === "video");
  const slides = materials.filter((m) => m.kind === "slide");
  const templates = materials.filter((m) => m.kind === "template");

  return (
    <div className="space-y-6">
      <div>
        <BackLink />
        <h1 className="mt-2 text-lg font-bold">
          第{week.week_no}週　{week.title}
        </h1>
        {week.goal && (
          <p className="mt-2 rounded-xl bg-teal/10 px-4 py-3 text-sm leading-relaxed">
            <span className="font-bold text-teal">この週のゴール：</span>
            {week.goal}
          </p>
        )}
      </div>

      {materials.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-sm text-navy/60">
          この週の教材はまだ登録されていません。
        </p>
      )}

      {videos.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Icon name="play" className="h-4 w-4 text-teal" />
            動画
          </h2>
          <div className="mt-3 space-y-4">
            {videos.map((m) => {
              const embed = m.external_url ? youtubeEmbedUrl(m.external_url) : null;
              return (
                <div key={m.id} className="overflow-hidden rounded-2xl bg-white">
                  {embed ? (
                    <div className="aspect-video">
                      <iframe
                        src={embed}
                        title={m.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  ) : (
                    m.external_url && (
                      <a
                        href={m.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 pt-4 text-sm font-bold text-teal underline underline-offset-4"
                      >
                        動画を開く
                      </a>
                    )
                  )}
                  <div className="px-4 py-3">
                    <p className="text-sm font-bold">{m.title}</p>
                    {m.note && (
                      <p className="mt-1 text-xs leading-relaxed text-navy/60">
                        {m.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {slides.length > 0 && (
        <MaterialSection title="スライドPDF" icon="file" items={slides} />
      )}
      {templates.length > 0 && (
        <MaterialSection title="配布テンプレ" icon="box" items={templates} />
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/library" className="text-sm text-teal underline underline-offset-4">
      ← 資料室へ戻る
    </Link>
  );
}

function MaterialSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: "file" | "box";
  items: Material[];
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <Icon name={icon} className="h-4 w-4 text-teal" />
        {title}
      </h2>
      <div className="mt-3 space-y-2">
        {items.map((m) => (
          <div key={m.id}>
            <MaterialLink materialId={m.id} title={m.title} icon={icon} />
            {m.note && (
              <p className="mt-1 px-1 text-xs leading-relaxed text-navy/60">
                {m.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
