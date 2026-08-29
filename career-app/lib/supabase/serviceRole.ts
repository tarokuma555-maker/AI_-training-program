import { createClient } from "@supabase/supabase-js";

/**
 * service_role キーのクライアント（RLSをバイパス。サーバー専用）。
 * 用途：受講生のAuthユーザー作成／教材の署名付きURL発行／AIチャットの書き込み。
 */
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
