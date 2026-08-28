export const DESIRE_OPTIONS = [
  { value: "career", label: "転職したい" },
  { value: "skill", label: "AIスキルを学びたい" },
] as const;

export const TIMING_OPTIONS = [
  { value: "within_3_months", label: "3か月以内" },
  { value: "within_6_months", label: "半年以内" },
  { value: "within_1_year", label: "1年以内" },
  { value: "undecided", label: "未定" },
] as const;

export const WEEKLY_HOURS_OPTIONS = [
  { value: "4h_plus", label: "4時間以上" },
  { value: "2_4h", label: "2〜4時間" },
  { value: "under_2h", label: "2時間未満" },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: "未処理",
  ai_reviewed: "AI一次判定済み",
  approved: "承認（無料相談案内）",
  waitlist: "見送り（次期案内）",
  skill_route: "スキル講座案内",
};

export type Desire = (typeof DESIRE_OPTIONS)[number]["value"];
export type DesiredTiming = (typeof TIMING_OPTIONS)[number]["value"];
export type WeeklyHours = (typeof WEEKLY_HOURS_OPTIONS)[number]["value"];

function labelOf(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined
): string {
  return options.find((o) => o.value === value)?.label ?? "−";
}

export const desireLabel = (v: string | null | undefined) =>
  labelOf(DESIRE_OPTIONS, v);
export const timingLabel = (v: string | null | undefined) =>
  labelOf(TIMING_OPTIONS, v);
export const weeklyHoursLabel = (v: string | null | undefined) =>
  labelOf(WEEKLY_HOURS_OPTIONS, v);
