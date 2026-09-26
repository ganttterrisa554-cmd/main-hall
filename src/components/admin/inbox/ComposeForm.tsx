"use client";

import { useActionState } from "react";
import { composeEmail } from "@/app/admin/actions";

const inputClass =
  "mt-1.5 w-full border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-copper";

export function ComposeForm({ to, personId, greeting }: { to: string; personId: string; greeting: string }) {
  const [state, action, pending] = useActionState(composeEmail, undefined);

  return (
    <form action={action} className="mt-8 max-w-2xl space-y-5">
      <input type="hidden" name="personId" value={personId} />
      <label className="block">
        <span className="text-sm text-ink">To</span>
        <input name="to" type="email" required defaultValue={to} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm text-ink">Subject</span>
        <input name="subject" required className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm text-ink">Message</span>
        <textarea name="body" rows={12} required defaultValue={greeting} className={`${inputClass} resize-y`} />
      </label>
      {state?.error && <p className="bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-copper px-6 py-3.5 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
