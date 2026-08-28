// 申込フォームの選択肢・型・バリデーション（クライアント／サーバー共用）

export const DESIRED_TRACKS = ["career", "skill"] as const;
export type DesiredTrack = (typeof DESIRED_TRACKS)[number];

export const DESIRED_TIMINGS = [
  "within_3m",
  "within_6m",
  "within_1y",
  "undecided",
] as const;
export type DesiredTiming = (typeof DESIRED_TIMINGS)[number];

export const WEEKLY_HOURS = ["4h_plus", "2h_4h", "under_2h"] as const;
export type WeeklyHours = (typeof WEEKLY_HOURS)[number];

export const TRACK_LABELS: Record<DesiredTrack, string> = {
  career: "転職したい",
  skill: "AIスキルを学びたい",
};

export const TIMING_LABELS: Record<DesiredTiming, string> = {
  within_3m: "3か月以内",
  within_6m: "半年以内",
  within_1y: "1年以内",
  undecided: "未定",
};

export const WEEKLY_HOURS_LABELS: Record<WeeklyHours, string> = {
  "4h_plus": "4時間以上",
  "2h_4h": "2〜4時間",
  under_2h: "2時間未満",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "未判定",
  ai_reviewed: "AI一次判定済み",
  approved: "承認（無料相談へ）",
  waitlist: "見送り（次期案内）",
  skill_route: "スキル講座案内",
};

export type ApplicationInput = {
  name: string;
  email: string;
  phone: string;
  desiredTrack: DesiredTrack | "";
  desiredJob: string;
  desiredTiming: DesiredTiming | "";
  judgmentExperience: string;
  weeklyHours: WeeklyHours | "";
  agreedWeek3Apply: boolean;
};

export type ValidationErrors = Partial<Record<keyof ApplicationInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-() ]{8,20}$/;

export function validateApplication(input: ApplicationInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.desiredTrack) {
    errors.desiredTrack = "ご希望を選択してください。";
  } else if (!DESIRED_TRACKS.includes(input.desiredTrack)) {
    errors.desiredTrack = "選択肢から選んでください。";
  }

  const isCareer = input.desiredTrack === "career";

  if (isCareer) {
    if (!input.desiredJob.trim()) {
      errors.desiredJob = "転職して就きたい仕事を入力してください。";
    } else if (input.desiredJob.length > 2000) {
      errors.desiredJob = "2000文字以内で入力してください。";
    }
    if (!input.desiredTiming) {
      errors.desiredTiming = "希望時期を選択してください。";
    } else if (!DESIRED_TIMINGS.includes(input.desiredTiming)) {
      errors.desiredTiming = "選択肢から選んでください。";
    }
    if (!input.agreedWeek3Apply) {
      errors.agreedWeek3Apply =
        "3週目から応募が始まることへの同意が必要です。";
    }
  }

  if (!input.judgmentExperience.trim()) {
    errors.judgmentExperience =
      "これまでの仕事で判断・管理していたことを入力してください。";
  } else if (input.judgmentExperience.length > 2000) {
    errors.judgmentExperience = "2000文字以内で入力してください。";
  }

  if (!input.weeklyHours) {
    errors.weeklyHours = "週に確保できる時間を選択してください。";
  } else if (!WEEKLY_HOURS.includes(input.weeklyHours)) {
    errors.weeklyHours = "選択肢から選んでください。";
  }

  if (!input.name.trim()) {
    errors.name = "氏名を入力してください。";
  } else if (input.name.length > 100) {
    errors.name = "100文字以内で入力してください。";
  }

  if (!input.email.trim()) {
    errors.email = "メールアドレスを入力してください。";
  } else if (!EMAIL_RE.test(input.email.trim()) || input.email.length > 254) {
    errors.email = "メールアドレスの形式が正しくありません。";
  }

  if (input.phone.trim() && !PHONE_RE.test(input.phone.trim())) {
    errors.phone = "電話番号の形式が正しくありません。";
  }

  return errors;
}
