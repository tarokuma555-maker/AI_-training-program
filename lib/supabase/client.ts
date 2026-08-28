"use client";

import { createBrowserClient } from "@supabase/ssr";

/** ブラウザ用クライアント（管理画面のログインで使用） */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
