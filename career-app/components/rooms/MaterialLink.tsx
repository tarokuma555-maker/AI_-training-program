"use client";

import { useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import { getMaterialSignedUrl } from "@/app/(student)/library/actions";

export default function MaterialLink({
  materialId,
  title,
  icon,
}: {
  materialId: string;
  title: string;
  icon: IconName;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    if (loading) return;
    setLoading(true);
    setError(null);
    const result = await getMaterialSignedUrl(materialId);
    setLoading(false);
    if (result.ok && result.url) {
      const win = window.open(result.url, "_blank", "noopener");
      if (!win) window.location.assign(result.url);
    } else {
      setError(result.message ?? "開けませんでした。");
    }
  }

  return (
    <div>
      <button
        onClick={handleOpen}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-xl border border-navy/10 bg-white px-4 py-3 text-left text-sm font-bold transition hover:bg-mist disabled:opacity-50"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy text-white">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <span className="flex-1">{title}</span>
        <span className="text-xs text-teal">{loading ? "発行中…" : "開く"}</span>
      </button>
      {error && <p className="mt-1 text-xs font-bold text-accent">{error}</p>}
    </div>
  );
}
