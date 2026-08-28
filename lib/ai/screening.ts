import Anthropic from "@anthropic-ai/sdk";
import { timingLabel, weeklyHoursLabel } from "@/lib/constants";
import type { AiRecommendation, AiVerdict, AiVerdictItem } from "@/lib/types";

const MODEL = "claude-opus-5";

/**
 * AI一次判定のプロンプト。
 * これは「一次判定」であり、結果が status を approved にすることはない。
 * 最終判断は管理画面で運営者が行う。
 */
export const SCREENING_PROMPT = `あなたは転職支援プログラムの申込内容を一次判定するアシスタントです。
申込内容を読み、次の3つの観点をそれぞれ YES / NO で判定してください。

観点:
1. target_job_specific: 「転職して就きたい仕事」に、具体的な職種・業界が書かれているか
2. judgment_experience: 「判断・管理していたこと」に、単なる「作業」ではなく自分の「判断」を伴う経験が書かれているか
3. schedule_realistic: 「希望時期」と「週に確保できる時間」の組み合わせが、6週間のプログラム（週1回2時間の講義＋週2〜3時間の課題）の受講と応募活動の前提として現実的か

ルール:
- 未回答の設問に依存する観点は NO とし、reason は「未回答のため判断できない」とする
- reason は必ず日本語1行・40文字以内で書く
- 出力は次の形式のJSONのみ。前後に説明文・コードブロック記法を付けない
{"target_job_specific":{"verdict":"YES","reason":"…"},"judgment_experience":{"verdict":"YES","reason":"…"},"schedule_realistic":{"verdict":"YES","reason":"…"}}`;

export interface ScreeningInput {
  targetJob: string | null;
  desiredTiming: string | null;
  managedExperience: string;
  weeklyHours: string;
}

export interface ScreeningResult {
  verdict: AiVerdict;
  recommendation: AiRecommendation;
}

/**
 * 申込内容をAIで一次判定する。
 * 呼び出し元は失敗（例外）時に status=pending のままにし、申込者のUIには影響させないこと。
 */
export async function runAiScreening(
  input: ScreeningInput
): Promise<ScreeningResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const applicationText = [
    `【転職して就きたい仕事】${input.targetJob?.trim() || "（未回答）"}`,
    `【希望時期】${input.desiredTiming ? timingLabel(input.desiredTiming) : "（未回答）"}`,
    `【判断・管理していたこと】${input.managedExperience.trim() || "（未回答）"}`,
    `【週に確保できる時間】${weeklyHoursLabel(input.weeklyHours)}`,
  ].join("\n");

  const response = await client.beta.messages.create(
    {
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      // 安全分類器による拒否時は別モデルで自動継続する（サーバーサイドフォールバック）
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SCREENING_PROMPT,
      messages: [{ role: "user", content: applicationText }],
    },
    { timeout: 45_000 }
  );

  if (response.stop_reason === "refusal") {
    throw new Error("AI一次判定がモデルに拒否されました");
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");

  const parsed = parseVerdictJson(text);
  const yesCount = [
    parsed.target_job_specific,
    parsed.judgment_experience,
    parsed.schedule_realistic,
  ].filter((item) => item.verdict === "YES").length;

  return {
    verdict: {
      ...parsed,
      model: response.model,
      evaluated_at: new Date().toISOString(),
    },
    recommendation: yesCount >= 2 ? "pass" : "review",
  };
}

function parseVerdictJson(text: string): {
  target_job_specific: AiVerdictItem;
  judgment_experience: AiVerdictItem;
  schedule_realistic: AiVerdictItem;
} {
  // コードブロック記法や前置きが混ざっても最初のJSONオブジェクトを取り出す
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI一次判定の出力からJSONを抽出できませんでした");
  }
  const raw: unknown = JSON.parse(text.slice(start, end + 1));

  const obj = raw as Record<string, { verdict?: unknown; reason?: unknown }>;
  const keys = [
    "target_job_specific",
    "judgment_experience",
    "schedule_realistic",
  ] as const;

  const items = {} as Record<(typeof keys)[number], AiVerdictItem>;
  for (const key of keys) {
    const item = obj?.[key];
    const verdict = String(item?.verdict ?? "").toUpperCase();
    const reason = String(item?.reason ?? "").trim();
    if ((verdict !== "YES" && verdict !== "NO") || !reason) {
      throw new Error(`AI一次判定の出力形式が不正です（${key}）`);
    }
    items[key] = { verdict, reason };
  }
  return items;
}
