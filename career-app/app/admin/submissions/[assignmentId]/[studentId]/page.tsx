import Link from "next/link";
import { notFound } from "next/navigation";
import AttachmentLink from "@/components/rooms/AttachmentLink";
import CommentForm from "@/components/admin/CommentForm";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Assignment, Profile, Submission } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionPage({
  params,
}: {
  params: { assignmentId: string; studentId: string };
}) {
  const supabase = createSupabaseServerClient();
  const [{ data: asgData }, { data: studentData }, { data: subData }] =
    await Promise.all([
      supabase
        .from("assignments")
        .select("*")
        .eq("id", params.assignmentId)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", params.studentId)
        .maybeSingle(),
      supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", params.assignmentId)
        .eq("student_id", params.studentId)
        .maybeSingle(),
    ]);

  if (!asgData || !studentData) notFound();
  const assignment = asgData as Assignment;
  const student = studentData as Profile;
  const submission = (subData ?? null) as Submission | null;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/assignments"
        className="text-sm text-teal underline underline-offset-4"
      >
        ← 提出マトリクスへ戻る
      </Link>

      <section className="rounded-2xl bg-white p-5">
        <h1 className="text-base font-bold">
          {student.name}／{assignment.title}
        </h1>
        <p className="mt-1 text-xs text-navy/60">
          締切 {formatDateTime(assignment.due_at)}
        </p>
      </section>

      {submission ? (
        <>
          <section className="rounded-2xl bg-white p-5">
            <h2 className="text-sm font-bold text-navy/60">
              提出内容（{formatDateTime(submission.submitted_at)}）
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
              {submission.body ?? "（本文なし）"}
            </p>
            {submission.storage_path && (
              <p className="mt-3">
                <AttachmentLink path={submission.storage_path} />
              </p>
            )}
          </section>
          <section className="rounded-2xl bg-white p-5">
            <h2 className="mb-3 text-sm font-bold">講師コメント</h2>
            <CommentForm
              submissionId={submission.id}
              initialComment={submission.admin_comment ?? ""}
            />
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-accent/40 bg-accent/10 p-5 text-sm font-bold">
          未提出です。
        </section>
      )}
    </div>
  );
}
