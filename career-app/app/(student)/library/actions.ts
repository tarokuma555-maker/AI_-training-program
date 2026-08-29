"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

/**
 * 教材の署名付きURLを発行する（有効期限60分）。
 * 閲覧権の判定はRLS（公開日・トラック）に任せる：RLSで見えない教材はここでも取得できない。
 */
export async function getMaterialSignedUrl(
  materialId: string
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "ログインが必要です。" };
  }

  const { data: material } = await supabase
    .from("materials")
    .select("id, storage_path")
    .eq("id", materialId)
    .maybeSingle();
  if (!material?.storage_path) {
    return { ok: false, message: "この教材は閲覧できません。" };
  }

  const service = createServiceRoleClient();
  const { data, error } = await service.storage
    .from("materials")
    .createSignedUrl(material.storage_path, 60 * 60);
  if (error || !data?.signedUrl) {
    return { ok: false, message: "URLの発行に失敗しました。時間をおいてお試しください。" };
  }
  return { ok: true, url: data.signedUrl };
}
