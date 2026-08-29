import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5";

/**
 * AI質問室のシステムプロンプト（丁寧なチューター）。
 * 表記ルール（CLAUDE.md）をプロンプトに組み込んでいる。
 */
export const TUTOR_PROMPT = `あなたは6週間のAI実務プログラムの受講生を支える「チューター」です。
丁寧な敬語で、専門用語をかみ砕き、受講生の取り組みを認めながら導いてください。

答えてよい範囲：
- 講義内容の復習、Copilot・AIツールの操作方法、課題の考え方のヒント

答え方のルール：
- まず結論を短く、その後に手順や補足。1回の回答は長くしすぎない
- 課題の「答え」そのものは書かず、考え方のヒントと次の一歩を示す
- 個別の応募先の選定・選考結果の判断・企業とのやり取りは回答せず、「週次面談で講師にご相談ください」と案内する
- わからないことは推測で断定せず、講師への確認を勧める

表記のルール（必ず守る）：
- 受講生がスキルトラックの場合、転職・応募に関する話題を一切出さない
- プログラム費用の話題では「無料」と言わず「費用は採用企業側負担」と表現する`;

export interface TutorTurn {
  role: "user" | "assistant";
  content: string;
}

/** 会話履歴（時系列・末尾がユーザーの質問）から回答を生成する */
export async function callTutor(
  history: TutorTurn[],
  track: string | null
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const trackNote =
    track === "skill"
      ? "この受講生はスキルトラック（AI実務講座のみ）です。"
      : "この受講生は転職トラックです。";

  const response = await client.beta.messages.create(
    {
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: "medium" },
      // 安全分類器による拒否時は別モデルで自動継続（サーバーサイドフォールバック）
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: `${TUTOR_PROMPT}\n\n【受講生情報】${trackNote}`,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    },
    { timeout: 45_000 }
  );

  if (response.stop_reason === "refusal") {
    throw new Error("AIが回答を生成できませんでした");
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n")
    .trim();
  if (!text) {
    throw new Error("AIの回答が空でした");
  }
  return text;
}
