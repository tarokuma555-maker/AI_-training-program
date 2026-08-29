"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/adminGuard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { youtubeEmbedUrl } from "@/lib/youtube";

type Result = { ok: boolean; message: string };

function revalidate() {
  revalidatePath("/admin/materials");
  revalidatePath("/library");
  revalidatePath("/");
}

export async function createWeek(input: {
  week_no: number;
  title: string;
  goal: string;
  publish_at: string;
  track: string;
}): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };
  if (!input.title.trim()) return { ok: false, message: "タイトルを入力してください。" };
  if (!input.publish_at) return { ok: false, message: "公開日を指定してください。" };
  if (!["common", "career", "skill"].includes(input.track)) {
    return { ok: false, message: "対象トラックが不正です。" };
  }
  if (!Number.isInteger(input.week_no) || input.week_no < 1 || input.week_no > 6) {
    return { ok: false, message: "週番号は1〜6で指定してください。" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("weeks").insert({
    week_no: input.week_no,
    title: input.title.trim(),
    goal: input.goal.trim() || null,
    publish_at: input.publish_at,
    track: input.track,
  });
  if (error) return { ok: false, message: `作成に失敗しました：${error.message}` };
  revalidate();
  return { ok: true, message: "週を作成しました。" };
}

export async function updateWeek(
  id: string,
  input: { title: string; goal: string; publish_at: string }
): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };
  if (!input.title.trim()) return { ok: false, message: "タイトルを入力してください。" };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("weeks")
    .update({
      title: input.title.trim(),
      goal: input.goal.trim() || null,
      publish_at: input.publish_at,
    })
    .eq("id", id);
  if (error) return { ok: false, message: `更新に失敗しました：${error.message}` };
  revalidate();
  return { ok: true, message: "週を更新しました。" };
}

export async function addMaterial(input: {
  week_id: string;
  kind: string;
  title: string;
  external_url?: string;
  storage_path?: string;
  note?: string;
}): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };
  if (!input.title.trim()) return { ok: false, message: "タイトルを入力してください。" };

  if (input.kind === "video") {
    if (!input.external_url || !youtubeEmbedUrl(input.external_url)) {
      return { ok: false, message: "YouTubeのURLとして解釈できません。" };
    }
  } else if (input.kind === "slide" || input.kind === "template") {
    if (!input.storage_path) {
      return { ok: false, message: "ファイルをアップロードしてください。" };
    }
  } else {
    return { ok: false, message: "教材の種別が不正です。" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("materials").insert({
    week_id: input.week_id,
    kind: input.kind,
    title: input.title.trim(),
    external_url: input.kind === "video" ? input.external_url : null,
    storage_path: input.kind === "video" ? null : input.storage_path,
    note: input.note?.trim() || null,
  });
  if (error) return { ok: false, message: `登録に失敗しました：${error.message}` };
  revalidate();
  return { ok: true, message: "教材を登録しました。" };
}

export async function deleteMaterial(id: string): Promise<Result> {
  if (!(await verifyAdmin())) return { ok: false, message: "管理者権限が必要です。" };

  const supabase = createSupabaseServerClient();
  const { data: material } = await supabase
    .from("materials")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) return { ok: false, message: `削除に失敗しました：${error.message}` };

  if (material?.storage_path) {
    const service = createServiceRoleClient();
    await service.storage.from("materials").remove([material.storage_path]);
  }
  revalidate();
  return { ok: true, message: "教材を削除しました。" };
}
