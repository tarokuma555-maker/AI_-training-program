export const TRACK_LABELS: Record<string, string> = {
  career: "転職トラック",
  skill: "スキルトラック",
};

export const WEEK_TRACK_LABELS: Record<string, string> = {
  common: "共通",
  career: "転職トラック",
  skill: "スキルトラック",
};

export const MATERIAL_KIND_LABELS: Record<string, string> = {
  video: "動画",
  slide: "スライドPDF",
  template: "配布テンプレ",
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  applied: "応募済み",
  doc_passed: "書類通過",
  interview_scheduling: "面接調整中",
  interviewed: "面接済み",
  offer: "内定",
  rejected: "見送り",
};

export const JOB_STATUS_ORDER = [
  "applied",
  "doc_passed",
  "interview_scheduling",
  "interviewed",
  "offer",
  "rejected",
] as const;

export const ATTENDANCE_LABELS: Record<string, string> = {
  present: "出席",
  recorded: "録画補講",
  absent: "欠席",
};

export const SLOT_KIND_LABELS: Record<string, string> = {
  meeting: "個別面談",
  lecture: "講義",
};

/** 課題添付の制限 */
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const UPLOAD_ALLOWED_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "docx",
  "xlsx",
  "pptx",
];
