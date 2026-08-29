import { NextResponse } from "next/server";
import { dailyLimit, jstDayStartIso } from "@/lib/ai/rate";
import { callTutor, type TutorTurn } from "@/lib/ai/tutor";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  let payload: { threadId?: string; message?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const message = (payload.message ?? "").trim();
  if (!message || message.length > 4000) {
    return NextResponse.json(
      { ok: false, message: "質問は1〜4000文字で入力してください。" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, message: "ログインが必要です。" },
      { status: 401 }
    );
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("track")
    .eq("id", user.id)
    .maybeSingle();

  // レート制限（当日の質問数・日本時間区切り）
  const limit = dailyLimit();
  const { count } = await supabase
    .from("ai_chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("student_id", user.id)
    .eq("role", "user")
    .gte("created_at", jstDayStartIso());
  const used = count ?? 0;
  if (used >= limit) {
    return NextResponse.json(
      {
        ok: false,
        remaining: 0,
        message: `本日の質問回数（${limit}問）の上限に達しました。明日またご利用ください。急ぎの場合は講師にご連絡ください。`,
      },
      { status: 429 }
    );
  }

  const service = createServiceRoleClient();

  // スレッドの確保（指定があれば本人のものか検証）
  let threadId = payload.threadId ?? null;
  if (threadId) {
    const { data: thread } = await supabase
      .from("ai_chat_threads")
      .select("id, student_id")
      .eq("id", threadId)
      .maybeSingle();
    if (!thread || thread.student_id !== user.id) {
      return NextResponse.json(
        { ok: false, message: "このスレッドには投稿できません。" },
        { status: 403 }
      );
    }
  } else {
    const title = message.length > 30 ? `${message.slice(0, 30)}…` : message;
    const { data: created, error } = await service
      .from("ai_chat_threads")
      .insert({ student_id: user.id, title })
      .select("id")
      .single();
    if (error || !created) {
      return NextResponse.json(
        { ok: false, message: "スレッドの作成に失敗しました。" },
        { status: 500 }
      );
    }
    threadId = created.id as string;
  }

  // ユーザーの発言を保存（失敗時もAIは呼ばない）
  const { error: insertError } = await service.from("ai_chat_messages").insert({
    thread_id: threadId,
    student_id: user.id,
    role: "user",
    content: message,
  });
  if (insertError) {
    return NextResponse.json(
      { ok: false, message: "質問の保存に失敗しました。" },
      { status: 500 }
    );
  }

  // 直近10往復（20件）を文脈として渡す
  const { data: historyRows } = await supabase
    .from("ai_chat_messages")
    .select("role, content, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(20);
  const history = ((historyRows ?? []) as TutorTurn[]).slice().reverse();

  let reply: string;
  try {
    reply = await callTutor(history, profile?.track ?? null);
  } catch (aiError) {
    console.error("AI質問室の応答生成に失敗:", aiError);
    return NextResponse.json(
      {
        ok: false,
        threadId,
        message:
          "回答の生成に失敗しました。時間をおいて、もう一度送信してください。",
      },
      { status: 502 }
    );
  }

  await service.from("ai_chat_messages").insert({
    thread_id: threadId,
    student_id: user.id,
    role: "assistant",
    content: reply,
  });
  await service
    .from("ai_chat_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", threadId);

  return NextResponse.json({
    ok: true,
    threadId,
    reply,
    remaining: Math.max(0, limit - (used + 1)),
  });
}
