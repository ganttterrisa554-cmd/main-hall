"use client";

import { useState } from "react";
import { company } from "@/data/company";

export function QuoteSentModal() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-5"
      onClick={() => setDismissed(true)}
    >
      <div
        className="w-full max-w-sm border border-[var(--line)] bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-2xl text-ink">Quote sent</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We&apos;re reviewing it now. To talk it through or confirm anything, call or text
          your producer directly:
        </p>
        <a
          href={company.phoneHref}
          className="font-display mt-5 block text-3xl text-copper transition hover:text-ink"
        >
          {company.phone}
        </a>
        <p className="mt-1 text-xs text-muted">Calls and texts both reach us.</p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-6 w-full bg-ink py-3 text-sm font-medium text-mist transition hover:bg-ink-soft"
        >
          Done
        </button>
      </div>
    </div>
  );
}
