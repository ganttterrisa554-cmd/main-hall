"use client";

import { useState, useTransition } from "react";
import { checkForNewMail } from "@/app/admin/actions";

export function CheckMailButton() {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      {note && <span className="text-sm text-muted">{note}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await checkForNewMail();
            setNote(result?.error ?? result?.ok ?? null);
          })
        }
        className="border border-ink/20 px-5 py-3 text-sm text-ink transition hover:border-ink disabled:opacity-50"
      >
        {pending ? "Checking…" : "Check for new mail"}
      </button>
    </div>
  );
}
