import { createClient } from "@supabase/supabase-js";

/**
 * サーバー側で使う anon キーのクライアント。
 * RLS が適用される（applications への insert のみ許可）。
 */
export function createAnonServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
