import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  TIMING_LABELS,
  TRACK_LABELS,
  WEEKLY_HOURS_LABELS,
} from "@/lib/applications";
import { formatDateTime, type ApplicationRow } from "@/lib/types";
import StatusBadge from "@/components/admin/StatusBadge";
import AiVerdictView from "@/components/admin/AiVerdictView";
import StatusActions from "@/components/admin/StatusActions";
import MailTemplates from "@/components/admin/MailTemplates";

export const dynamic = "force-dynamic";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-navy/5 py-3 last:border-b-0 sm:grid-cols-[220px_1fr]">
      <dt className="text-xs font-medium text-navy/60">{label}</dt>
      <dd className="text-sm leading-relaxed">{value ?? "-"}</dd>
    </div>
  );
}

export default async function AdminDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        申込の取得に失敗しました：{error.message}
      </p>
    );
  }
  if (!data) {
    notFound();
  }

  const app = data as ApplicationRow;
  const isCareer = app.desired_track === "career";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin"
            className="text-xs text-teal underline hover:opacity-80"
          >
            ← 申込一覧へ戻る
          </Link>
          <h1 className="mt-2 text-xl font-bold">{app.name} さんの申込</h1>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <Section title="申込者情報">
        <dl>
          <Row label="申込日時" value={formatDateTime(app.created_at)} />
          <Row label="氏名" value={app.name} />
          <Row label="メールアドレス" value={app.email} />
          <Row label="電話番号" value={app.phone ?? "（未記入）"} />
        </dl>
      </Section>

      <Section title="回答内容">
        <dl>
          <Row
            label="1. ご希望"
            value={TRACK_LABELS[app.desired_track] ?? app.desired_track}
          />
          {isCareer && (
            <>
              <Row
                label="2. 転職して就きたい仕事"
                value={
                  <span className="whitespace-pre-wrap">{app.desired_job}</span>
                }
              />
              <Row
                label="3. 希望時期"
                value={
                  app.desired_timing
                    ? TIMING_LABELS[app.desired_timing]
                    : "（未回答）"
                }
              />
            </>
          )}
          <Row
            label={`${isCareer ? "4" : "2"}. 判断・管理していたこと`}
            value={
              <span className="whitespace-pre-wrap">
                {app.judgment_experience}
              </span>
            }
          />
          <Row
            label={`${isCareer ? "5" : "3"}. 週に確保できる時間`}
            value={WEEKLY_HOURS_LABELS[app.weekly_hours] ?? app.weekly_hours}
          />
          {isCareer && (
            <Row
              label="6. 3週目からの応募開始への同意"
              value={app.agreed_week3_apply ? "同意あり" : "同意なし"}
            />
          )}
        </dl>
      </Section>

      <Section title="AI一次判定">
        <AiVerdictView
          verdict={app.ai_verdict}
          recommendation={app.ai_recommendation}
        />
        {app.ai_verdict && (
          <p className="mt-4 text-xs text-navy/50">
            判定日時：{formatDateTime(app.ai_verdict.screened_at)}／
            あくまで一次判定です。最終判断は下のボタンで行ってください。
          </p>
        )}
        {!app.ai_verdict && !isCareer && (
          <p className="mt-2 text-xs text-navy/50">
            スキル希望の申込はAI判定の対象外です。内容を確認して振り分けてください。
          </p>
        )}
      </Section>

      <Section title="最終判断（ステータス変更）">
        {app.reviewed_at && (
          <p className="mb-4 rounded-xl bg-base px-4 py-3 text-xs text-navy/70">
            最終審査：{formatDateTime(app.reviewed_at)}
            {app.reviewer_note && (
              <>
                ／メモ：
                <span className="whitespace-pre-wrap">{app.reviewer_note}</span>
              </>
            )}
          </p>
        )}
        <StatusActions
          applicationId={app.id}
          initialNote={app.reviewer_note ?? ""}
        />
      </Section>

      <Section title="案内メールの定型文">
        <MailTemplates />
      </Section>
    </div>
  );
}
