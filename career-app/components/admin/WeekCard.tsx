"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addMaterial,
  deleteMaterial,
  updateWeek,
} from "@/app/admin/materials/actions";
import { MATERIAL_KIND_LABELS, WEEK_TRACK_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Material, Week } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-3 py-2 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function WeekCard({
  week,
  materials,
}: {
  week: Week;
  materials: Material[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // 週の編集
  const [title, setTitle] = useState(week.title);
  const [goal, setGoal] = useState(week.goal ?? "");
  const [publishAt, setPublishAt] = useState(toLocalInput(week.publish_at));

  // 教材の追加
  const [kind, setKind] = useState("video");
  const [mTitle, setMTitle] = useState("");
  const [mUrl, setMUrl] = useState("");
  const [mNote, setMNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await fn();
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) router.refresh();
    });
  }

  async function handleAddMaterial(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    let storagePath: string | undefined;
    if (kind !== "video") {
      if (!file) {
        setMessage({ ok: false, text: "ファイルを選択してください。" });
        return;
      }
      setUploading(true);
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${week.week_no}/${Date.now()}_${safeName}`;
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from("materials")
        .upload(path, file);
      setUploading(false);
      if (error) {
        setMessage({ ok: false, text: `アップロードに失敗しました：${error.message}` });
        return;
      }
      storagePath = path;
    }

    run(async () => {
      const result = await addMaterial({
        week_id: week.id,
        kind,
        title: mTitle,
        external_url: kind === "video" ? mUrl : undefined,
        storage_path: storagePath,
        note: mNote,
      });
      if (result.ok) {
        setMTitle("");
        setMUrl("");
        setMNote("");
        setFile(null);
      }
      return result;
    });
  }

  return (
    <section className="rounded-2xl bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-bold">
          第{week.week_no}週　{week.title}
        </h2>
        <span className="rounded-full bg-mist px-3 py-0.5 text-xs font-bold text-navy/60">
          {WEEK_TRACK_LABELS[week.track]}
        </span>
        <span className="text-xs text-navy/60">
          公開：{formatDateTime(week.publish_at)}
        </span>
      </div>

      {/* 週の編集 */}
      <details className="mt-3 rounded-xl bg-mist/60 p-3">
        <summary className="cursor-pointer text-xs font-bold text-navy/70">
          週の情報を編集
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className={inputClass} placeholder="タイトル" />
          <input type="datetime-local" value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)} className={inputClass} />
          <input value={goal} onChange={(e) => setGoal(e.target.value)}
            className={`${inputClass} sm:col-span-2`} placeholder="この週のゴール" />
          <div>
            <button
              onClick={() =>
                run(() =>
                  updateWeek(week.id, {
                    title,
                    goal,
                    publish_at: new Date(publishAt).toISOString(),
                  })
                )
              }
              disabled={isPending}
              className="rounded-full bg-navy px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              更新
            </button>
          </div>
        </div>
      </details>

      {/* 教材一覧 */}
      <ul className="mt-4 space-y-2">
        {materials.length === 0 && (
          <li className="text-sm text-navy/50">教材はまだありません。</li>
        )}
        {materials.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-navy/10 px-3 py-2 text-sm"
          >
            <span className="rounded bg-teal/10 px-2 py-0.5 text-xs font-bold text-teal">
              {MATERIAL_KIND_LABELS[m.kind]}
            </span>
            <span className="flex-1 font-bold">{m.title}</span>
            <button
              onClick={() => {
                if (window.confirm(`「${m.title}」を削除しますか？`)) {
                  run(() => deleteMaterial(m.id));
                }
              }}
              disabled={isPending}
              className="text-xs font-bold text-accent underline underline-offset-2 disabled:opacity-50"
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      {/* 教材の追加 */}
      <form onSubmit={handleAddMaterial} className="mt-4 grid gap-2 rounded-xl bg-mist/60 p-3 sm:grid-cols-2">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
          <option value="video">動画（YouTube限定公開URL）</option>
          <option value="slide">スライドPDF（アップロード）</option>
          <option value="template">配布テンプレ（アップロード）</option>
        </select>
        <input value={mTitle} onChange={(e) => setMTitle(e.target.value)}
          required className={inputClass} placeholder="教材タイトル" />
        {kind === "video" ? (
          <input value={mUrl} onChange={(e) => setMUrl(e.target.value)} type="url"
            required className={`${inputClass} sm:col-span-2`}
            placeholder="https://youtu.be/…（限定公開URL）" />
        ) : (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={`${inputClass} sm:col-span-2`}
          />
        )}
        <input value={mNote} onChange={(e) => setMNote(e.target.value)}
          className={`${inputClass} sm:col-span-2`} placeholder="講師メモ（任意）" />
        <div>
          <button type="submit" disabled={isPending || uploading}
            className="rounded-full bg-teal px-5 py-2 text-xs font-bold text-white disabled:opacity-50">
            {uploading ? "アップロード中…" : isPending ? "登録中…" : "教材を追加"}
          </button>
        </div>
      </form>

      {message && (
        <p className={`mt-3 text-sm font-bold ${message.ok ? "text-teal" : "text-accent"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
