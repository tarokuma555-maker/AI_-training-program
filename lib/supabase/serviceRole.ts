import { createClient } from "@supabase/supabase-js";

/**
 * service_role キーのクライアント（RLSをバイパスする。サーバー専用）。
 * AI一次判定の結果書き込みなど、システム側の更新にのみ使う。
 */
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
