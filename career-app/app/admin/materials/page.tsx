import WeekCard from "@/components/admin/WeekCard";
import WeekForm from "@/components/admin/WeekForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Material, Week } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: weekRows }, { data: materialRows }] = await Promise.all([
    supabase.from("weeks").select("*").order("week_no").order("track"),
    supabase
      .from("materials")
      .select("*")
      .order("sort_order")
      .order("created_at"),
  ]);
  const weeks = (weekRows ?? []) as Week[];
  const materials = (materialRows ?? []) as Material[];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5">
        <h1 className="text-base font-bold">週の作成</h1>
        <p className="mt-1 text-xs text-navy/60">
          週を作成し、公開日時を設定します。公開日時まで受講生にはロック表示されます。
        </p>
        <div className="mt-4">
          <WeekForm />
        </div>
      </section>

      {weeks.map((week) => (
        <WeekCard
          key={week.id}
          week={week}
          materials={materials.filter((m) => m.week_id === week.id)}
        />
      ))}
    </div>
  );
}
