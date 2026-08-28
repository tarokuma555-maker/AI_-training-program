"use client";

import { useState } from "react";

export interface TemplateItem {
  key: string;
  label: string;
  text: string;
}

/** statusに応じた案内メールの定型文をクリップボードにコピーするボタン群 */
export default function CopyTemplates({
  templates,
}: {
  templates: TemplateItem[];
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function handleCopy(item: TemplateItem) {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedKey(item.key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      window.prompt("コピーできませんでした。手動でコピーしてください：", item.text);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {templates.map((item) => (
        <button
          key={item.key}
          onClick={() => handleCopy(item)}
          className="rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm font-bold text-navy transition hover:bg-mist"
        >
          {copiedKey === item.key ? "コピーしました ✓" : `${item.label}をコピー`}
        </button>
      ))}
    </div>
  );
}
