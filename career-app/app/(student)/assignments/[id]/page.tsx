import Link from "next/link";
import { notFound } from "next/navigation";
import AttachmentLink from "@/components/rooms/AttachmentLink";
import SubmissionForm from "@/components/rooms/SubmissionForm";
import { formatDateTime } from "@/lib/format";
import { requireProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Assignment, Submission } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AssignmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile();
  const supabase = createSupabaseServerClient();

  const { data: asgData } = await supabase
    .from("assignments")
    .select("*, week:weeks(week_no, title)")
    .eq("id", params.id)
    .maybeSingle();
  if (!asgData) notFound();
  const assignment = asgData as unknown as Assignment & {
    week: { week_no: number; title: string } | null;
  };

  const { data: subData } = await supabase
    .from("submissions")
    .select("*")
    .eq("assignment_id", assignment.id)
    .eq("student_id", profile.id)
    .maybeSingle();
  const submission = (subData ?? null) as Submission | null;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/assignments"
          className="text-sm text-teal underline underline-offset-4"
        >
          ← 課題一覧へ戻る
        </Link>
        <h1 className="mt-2 text-lg font-bold">{assignment.title}</h1>
        <p className="mt-1 text-xs text-navy/60">
          {assignment.week ? `第${assignment.week.week_no}週` : ""}・締切{" "}
          {formatDateTime(assignment.due_at)}
        </p>
      </div>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-sm font-bold text-navy/60">課題の内容</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
          {assignment.description}
        </p>
      </section>

      {submission && (
        <section className="rounded-2xl bg-teal/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-bold text-teal">
              提出済み（{formatDateTime(submission.submitted_at)}）
            </h2>
            <span
              className={`flex h-11 w-11 shrink-0 -rotate-12 items-center justify-center rounded-full border-2 text-xs font-bold ${
                submission.admin_comment
                  ? "border-accent text-accent"
                  : "border-teal text-teal"
              }`}
            >
              {submission.admin_comment ? "講評" : "済"}
            </span>
          </div>
          {submission.storage_path && (
            <p className="mt-2">
              <AttachmentLink path={submission.storage_path} />
            </p>
          )}
          {submission.admin_comment && (
            <div className="mt-3 rounded-xl bg-white p-4">
              <p className="text-xs font-bold text-navy/60">講師からのコメント</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                {submission.admin_comment}
              </p>
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl bg-white p-5">
        <h2 className="mb-4 text-sm font-bold">
          {submission ? "再提出（前回の内容を上書きします）" : "提出フォーム"}
        </h2>
        <SubmissionForm
          assignmentId={assignment.id}
          initialBody={submission?.body ?? ""}
          hasExistingSubmission={Boolean(submission)}
          existingPath={submission?.storage_path ?? null}
        />
      </section>
    </div>
  );
}
