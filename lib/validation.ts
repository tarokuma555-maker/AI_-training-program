import {
  DESIRE_OPTIONS,
  TIMING_OPTIONS,
  WEEKLY_HOURS_OPTIONS,
} from "@/lib/constants";
import type { ApplicationInput } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT = 2000;
const MAX_SHORT = 200;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  /** DB に insert する行（ok のときのみ有効） */
  row: Record<string, unknown> | null;
}

/** サーバー側バリデーション（正）。クライアントは同等のチェックを補助的に行う */
export function validateApplicationInput(input: unknown): ValidationResult {
  const errors: string[] = [];
  const body = (input ?? {}) as Partial<ApplicationInput>;

  const desire = body.desire;
  if (!DESIRE_OPTIONS.some((o) => o.value === desire)) {
    errors.push("ご希望を選択してください。");
  }
  const isCareer = desire === "career";

  const targetJob = typeof body.targetJob === "string" ? body.targetJob.trim() : "";
  if (isCareer && !targetJob) {
    errors.push("転職して就きたい仕事を入力してください。");
  }
  if (targetJob.length > MAX_TEXT) {
    errors.push("転職して就きたい仕事は2000文字以内で入力してください。");
  }

  const desiredTiming = body.desiredTiming;
  if (isCareer && !TIMING_OPTIONS.some((o) => o.value === desiredTiming)) {
    errors.push("希望時期を選択してください。");
  }

  const managedExperience =
    typeof body.managedExperience === "string" ? body.managedExperience.trim() : "";
  if (!managedExperience) {
    errors.push("これまでの仕事で判断・管理していたことを入力してください。");
  }
  if (managedExperience.length > MAX_TEXT) {
    errors.push("判断・管理していたことは2000文字以内で入力してください。");
  }

  const weeklyHours = body.weeklyHours;
  if (!WEEKLY_HOURS_OPTIONS.some((o) => o.value === weeklyHours)) {
    errors.push("週に確保できる時間を選択してください。");
  }

  if (isCareer && body.agreeApplyWeek3 !== true) {
    errors.push("3週目から応募が始まることへの同意が必要です。");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    errors.push("氏名を入力してください。");
  }
  if (name.length > MAX_SHORT) {
    errors.push("氏名は200文字以内で入力してください。");
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !EMAIL_RE.test(email)) {
    errors.push("メールアドレスを正しく入力してください。");
  }
  if (email.length > MAX_SHORT) {
    errors.push("メールアドレスは200文字以内で入力してください。");
  }

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (phone && !/^[0-9+\-() ]{6,20}$/.test(phone)) {
    errors.push("電話番号の形式が正しくありません。");
  }

  if (errors.length > 0) {
    return { ok: false, errors, row: null };
  }

  return {
    ok: true,
    errors: [],
    row: {
      desire,
      target_job: isCareer ? targetJob : null,
      desired_timing: isCareer ? desiredTiming : null,
      managed_experience: managedExperience,
      weekly_hours: weeklyHours,
      agree_apply_week3: isCareer ? true : false,
      name,
      email,
      phone: phone || null,
    },
  };
}
