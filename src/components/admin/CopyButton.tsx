"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy message" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
      }
      className="border border-ink/20 px-4 py-2 text-sm text-ink transition hover:border-ink"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
