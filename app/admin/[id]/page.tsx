import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CopyTemplates from "@/components/admin/CopyTemplates";
import StatusActions from "@/components/admin/StatusActions";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  desireLabel,
  timingLabel,
  weeklyHoursLabel,
} from "@/lib/constants";
import { EMAIL_TEMPLATES } from "@/lib/emailTemplates";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";

export const dynamic = "force-dynamic";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6">
      <h2 className="text-base font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-navy/5 py-3 last:border-0">
      <dt className="text-xs font-bold text-navy/60">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
        {value}
      </dd>
    </div>
  );
}

export default async function AdminDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }
  const app = data as Application;

  const verdictRows = app.ai_verdict
    ? [
        {
          label: "① 就きたい仕事が具体的か",
          item: app.ai_verdict.target_job_specific,
        },
        {
          label: "② 判断を伴う経験があるか",
          item: app.ai_verdict.judgment_experience,
        },
        {
          label: "③ 時期と時間の組み合わせが現実的か",
          item: app.ai_verdict.schedule_realistic,
        },
      ]
    : [];

  const templates = (
    Object.entries(EMAIL_TEMPLATES) as [
      keyof typeof EMAIL_TEMPLATES,
      (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES],
    ][]
  ).map(([key, t]) => ({
    key,
    label: t.label,
    text: t.build(app.name),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-teal underline underline-offset-4">
          ← 一覧へ戻る
        </Link>
        <StatusBadge status={app.status} />
      </div>

      <Card title="申込者">
        <dl>
          <Row label="申込日時" value={formatDateTime(app.created_at)} />
          <Row label="氏名" value={app.name} />
          <Row label="メールアドレス" value={app.email} />
          <Row label="電話番号" value={app.phone ?? "−"} />
        </dl>
      </Card>

      <Card title="回答内容">
        <dl>
          <Row label="ご希望" value={desireLabel(app.desire)} />
          <Row
            label="転職して就きたい仕事"
            value={app.target_job ?? "−"}
          />
          <Row label="希望時期" value={timingLabel(app.desired_timing)} />
          <Row
            label="判断・管理していたこと"
            value={app.managed_experience}
          />
          <Row
            label="週に確保できる時間"
            value={weeklyHoursLabel(app.weekly_hours)}
          />
          <Row
            label="3週目から応募開始への同意"
            value={app.agree_apply_week3 ? "同意あり" : "−"}
          />
        </dl>
      </Card>

      <Card title="AI一次判定">
        {app.ai_verdict ? (
          <div>
            <p className="text-sm">
              一次判定：
              <span
                className={`ml-2 inline-block rounded px-2 py-0.5 text-xs font-bold ${
                  app.ai_recommendation === "pass"
                    ? "bg-teal/15 text-teal"
                    : "bg-accent/15 text-accent"
                }`}
              >
                {app.ai_recommendation === "pass"
                  ? "pass（2つ以上YES）"
                  : "review（要確認）"}
              </span>
            </p>
            <ul className="mt-4 space-y-3">
              {verdictRows.map((row) => (
                <li key={row.label} className="rounded-xl bg-mist p-4">
                  <p className="text-xs font-bold text-navy/60">{row.label}</p>
                  <p className="mt-1 text-sm">
                    <span
                      className={`mr-2 font-bold ${
                        row.item.verdict === "YES" ? "text-teal" : "text-accent"
                      }`}
                    >
                      {row.item.verdict}
                    </span>
                    {row.item.reason}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-navy/50">
              判定日時：{formatDateTime(app.ai_verdict.evaluated_at)}（
              {app.ai_verdict.model}）
            </p>
          </div>
        ) : (
          <p className="text-sm text-navy/60">
            未判定です（AI一次判定が未実行、または失敗）。
          </p>
        )}
        <p className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-3 text-xs leading-relaxed text-navy/80">
          これは<span className="font-bold">一次判定</span>
          です。受講可否の最終判断は、この画面で運営者が行ってください。
        </p>
      </Card>

      <Card title="最終判断">
        <dl className="mb-5">
          <Row label="最終判断日時" value={formatDateTime(app.reviewed_at)} />
          <Row label="審査メモ" value={app.reviewer_note ?? "−"} />
        </dl>
        <StatusActions id={app.id} initialNote={app.reviewer_note ?? ""} />
      </Card>

      <Card title="案内メールの定型文">
        <p className="mb-4 text-xs leading-relaxed text-navy/60">
          メール送信機能はありません。statusに応じた定型文をコピーして、お使いのメールから送信してください（文面は差し替え予定のプレースホルダです）。
        </p>
        <CopyTemplates templates={templates} />
      </Card>
    </div>
  );
}
