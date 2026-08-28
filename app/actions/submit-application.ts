"use server";

import { randomUUID } from "crypto";
import { createAnonClient } from "@/lib/supabase/anon";
import {
  type ApplicationInput,
  type ValidationErrors,
  validateApplication,
} from "@/lib/applications";

export type SubmitResult =
  | { ok: true }
  | { ok: false; errors?: ValidationErrors; message?: string };

export async function submitApplication(
  input: ApplicationInput
): Promise<SubmitResult> {
  // サーバー側でも必ずバリデーションする（クライアントの検証は信用しない）
  const errors = validateApplication(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // RLSでanonはselect不可のため、idをサーバー側で発行してinsertする
  const id = randomUUID();
  const isCareer = input.desiredTrack === "career";

  try {
    const supabase = createAnonClient();
    const { error } = await supabase.from("applications").insert({
      id,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim() || null,
      desired_track: input.desiredTrack,
      desired_job: isCareer ? input.desiredJob.trim() : null,
      desired_timing: isCareer ? input.desiredTiming : null,
      judgment_experience: input.judgmentExperience.trim(),
      weekly_hours: input.weeklyHours,
      agreed_week3_apply: isCareer ? input.agreedWeek3Apply : false,
    });
    if (error) throw error;
  } catch (e) {
    console.error("申込の保存に失敗しました:", e);
    return {
      ok: false,
      message:
        "送信に失敗しました。お手数ですが、時間をおいて再度お試しください。",
    };
  }

  return { ok: true };
}
