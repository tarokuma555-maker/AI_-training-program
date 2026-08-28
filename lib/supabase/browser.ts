"use client";

import { createBrowserClient } from "@supabase/ssr";

// 管理画面のログイン（マジックリンク送信）に使うブラウザクライアント
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabaseの環境変数（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY）が未設定です。"
    );
  }
  return createBrowserClient(url, anonKey);
}
