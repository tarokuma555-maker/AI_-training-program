import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // 静的アセット以外すべてを認証ガードの対象にする
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
