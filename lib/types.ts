import type { Desire, DesiredTiming, WeeklyHours } from "@/lib/constants";

export type ApplicationStatus =
  | "pending"
  | "ai_reviewed"
  | "approved"
  | "waitlist"
  | "skill_route";

export type AiRecommendation = "pass" | "review";

/** AI一次判定の各設問の判定結果 */
export interface AiVerdictItem {
  verdict: "YES" | "NO";
  reason: string;
}

/** applications.ai_verdict (jsonb) の中身 */
export interface AiVerdict {
  target_job_specific: AiVerdictItem; // ① 設問2に具体的な職種・業界が書かれているか
  judgment_experience: AiVerdictItem; // ② 設問4に「判断」を伴う経験があるか
  schedule_realistic: AiVerdictItem; // ③ 設問3と5の組み合わせが現実的か
  model: string;
  evaluated_at: string;
}

export interface Application {
  id: string;
  created_at: string;
  desire: Desire;
  target_job: string | null;
  desired_timing: DesiredTiming | null;
  managed_experience: string;
  weekly_hours: WeeklyHours;
  agree_apply_week3: boolean;
  name: string;
  email: string;
  phone: string | null;
  status: ApplicationStatus;
  ai_verdict: AiVerdict | null;
  ai_recommendation: AiRecommendation | null;
  reviewed_at: string | null;
  reviewer_note: string | null;
}

/** 申込フォームから API に送るペイロード */
export interface ApplicationInput {
  desire: Desire;
  targetJob?: string;
  desiredTiming?: DesiredTiming;
  managedExperience: string;
  weeklyHours: WeeklyHours;
  agreeApplyWeek3?: boolean;
  name: string;
  email: string;
  phone?: string;
}
