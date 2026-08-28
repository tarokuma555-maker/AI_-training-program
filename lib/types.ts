import type { DesiredTiming, DesiredTrack, WeeklyHours } from "@/lib/applications";
import type { ScreeningVerdict } from "@/lib/ai/screening";

// applicationsテーブルの行（管理画面での表示用）
export type ApplicationRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  desired_track: DesiredTrack;
  desired_job: string | null;
  desired_timing: DesiredTiming | null;
  judgment_experience: string;
  weekly_hours: WeeklyHours;
  agreed_week3_apply: boolean;
  status: "pending" | "ai_reviewed" | "approved" | "waitlist" | "skill_route";
  ai_verdict: ScreeningVerdict | null;
  ai_recommendation: "pass" | "review" | null;
  reviewed_at: string | null;
  reviewer_note: string | null;
};

export const SCREENING_ITEM_LABELS: Record<string, string> = {
  q2_specific_goal: "設問2：職種・業界が具体的か",
  q4_judgment_experience: "設問4：判断を伴う経験か",
  q3_q5_realistic: "設問3×5：時期と時間の組み合わせが現実的か",
};

export function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
