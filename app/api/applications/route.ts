import { NextResponse } from "next/server";
import { createAnonServerClient } from "@/lib/supabase/anonServer";
import { validateApplicationInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["リクエストの形式が正しくありません。"] },
      { status: 400 }
    );
  }

  const result = validateApplicationInput(payload);
  if (!result.ok || !result.row) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 400 }
    );
  }

  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("applications")
    .insert(result.row)
    .select("id")
    .single();

  if (error || !data) {
    console.error("申込の保存に失敗しました:", error);
    return NextResponse.json(
      {
        ok: false,
        errors: [
          "送信に失敗しました。時間をおいて再度お試しください。",
        ],
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
