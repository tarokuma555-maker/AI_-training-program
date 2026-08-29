"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** submissionsバケットの添付を署名付きURLで開く（RLSで本人とadminのみ可） */
export default function AttachmentLink({
  path,
  label = "添付ファイルを開く",
}: {
  path: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    if (loading) return;
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data, error: urlError } = await supabase.storage
      .from("submissions")
      .createSignedUrl(path, 60 * 60);
    setLoading(false);
    if (urlError || !data?.signedUrl) {
      setError("ファイルを開けませんでした。");
      return;
    }
    const win = window.open(data.signedUrl, "_blank", "noopener");
    if (!win) window.location.assign(data.signedUrl);
  }

  return (
    <span>
      <button
        onClick={handleOpen}
        disabled={loading}
        className="text-sm font-bold text-teal underline underline-offset-4 disabled:opacity-50"
      >
        {loading ? "発行中…" : label}
      </button>
      {error && <span className="ml-2 text-xs font-bold text-accent">{error}</span>}
    </span>
  );
}
