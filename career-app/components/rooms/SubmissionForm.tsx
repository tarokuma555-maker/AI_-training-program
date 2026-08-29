"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAssignment } from "@/app/(student)/assignments/actions";
import {
  UPLOAD_ALLOWED_EXTENSIONS,
  UPLOAD_MAX_BYTES,
} from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SubmissionForm({
  assignmentId,
  initialBody,
  hasExistingSubmission,
  existingPath,
}: {
  assignmentId: string;
  initialBody: string;
  hasExistingSubmission: boolean;
  existingPath: string | null;
}) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    let storagePath: string | undefined = existingPath ?? undefined;
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!UPLOAD_ALLOWED_EXTENSIONS.includes(ext)) {
        setMessage({
          ok: false,
          text: `このファイル形式は添付できません（${UPLOAD_ALLOWED_EXTENSIONS.join(" / ")}）。`,
        });
        return;
      }
      if (file.size > UPLOAD_MAX_BYTES) {
        setMessage({ ok: false, text: "ファイルは10MB以下にしてください。" });
        return;
      }

      setUploading(true);
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUploading(false);
        setMessage({ ok: false, text: "ログインが必要です。" });
        return;
      }
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${user.id}/${assignmentId}/${Date.now()}_${safeName}`;
      const { error } = await supabase.storage
        .from("submissions")
        .upload(path, file);
      setUploading(false);
      if (error) {
        setMessage({
          ok: false,
          text: `アップロードに失敗しました：${error.message}`,
        });
        return;
      }
      storagePath = path;
    }

    startTransition(async () => {
      const result = await submitAssignment({
        assignmentId,
        body,
        storagePath,
      });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        setFile(null);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="body" className="block text-sm font-bold">
          提出内容
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          maxLength={10000}
          className="mt-2 w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          placeholder="課題の回答や、取り組んだ内容を記入してください"
        />
      </div>
      <div>
        <label htmlFor="file" className="block text-sm font-bold">
          ファイル添付（任意・10MBまで）
        </label>
        <input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-2 w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm"
        />
        <p className="mt-1 text-xs text-navy/50">
          {UPLOAD_ALLOWED_EXTENSIONS.join(" / ")}
          {existingPath && !file && "（新しいファイルを選ぶと差し替えます）"}
        </p>
      </div>
      {message && (
        <p
          role="alert"
          className={`text-sm font-bold ${message.ok ? "text-teal" : "text-accent"}`}
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending || uploading}
        className="w-full rounded-full bg-accent px-8 py-3 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {uploading
          ? "アップロード中…"
          : isPending
            ? "提出中…"
            : hasExistingSubmission
              ? "再提出する（上書き）"
              : "提出する"}
      </button>
    </form>
  );
}
