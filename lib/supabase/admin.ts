import { createClient } from "@supabase/supabase-js";

// service_roleキーのクライアント（RLSを通過する）。
// サーバー側のAI一次判定の結果保存のみに使用し、クライアントには絶対に渡さないこと。
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabaseの環境変数（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）が未設定です。"
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
