import { NextResponse } from "next/server";
import { runAiScreening } from "@/lib/ai/screening";
import { createAnonServerClient } from "@/lib/supabase/anonServer";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { validateApplicationInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// AI一次判定を同一リクエスト内で行うため、実行時間の上限を延長する
export const maxDuration = 60;

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

  // AI一次判定。失敗しても申込は status=pending のまま保存済みで、
  // 申込者への応答には影響させない（判定失敗をUIに出さない）
  try {
    const { verdict, recommendation } = await runAiScreening({
      targetJob: result.row.target_job as string | null,
      desiredTiming: result.row.desired_timing as string | null,
      managedExperience: result.row.managed_experience as string,
      weeklyHours: result.row.weekly_hours as string,
    });

    // AIは approved にしない。ai_reviewed で止め、最終判断は管理画面で人間が行う
    const serviceRole = createServiceRoleClient();
    const { error: updateError } = await serviceRole
      .from("applications")
      .update({
        ai_verdict: verdict,
        ai_recommendation: recommendation,
        status: "ai_reviewed",
      })
      .eq("id", data.id)
      .eq("status", "pending");
    if (updateError) {
      console.error("AI一次判定の保存に失敗しました:", updateError);
    }
  } catch (aiError) {
    console.error("AI一次判定に失敗しました（statusはpendingのまま）:", aiError);
  }

  return NextResponse.json({ ok: true });
}
