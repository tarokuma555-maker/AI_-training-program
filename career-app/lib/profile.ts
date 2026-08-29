import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * ログイン中ユーザーのプロフィールを取得する（リクエスト内でキャッシュ）。
 * 未ログインは/loginへ。profiles未登録（招待漏れ）はログアウト相当として/loginへ。
 */
export const requireProfile = cache(async (): Promise<Profile> => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    redirect("/login?error=no_profile");
  }
  return data as Profile;
});

/** admin以外を弾く */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    redirect("/");
  }
  return profile;
}
