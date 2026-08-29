import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Server Action用のadmin検証（redirectせず真偽を返す） */
export async function verifyAdmin(): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.role === "admin";
}
