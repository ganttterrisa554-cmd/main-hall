"use client";

import { useActionState } from "react";
import { signAgreement } from "@/app/partners/actions";

export function SignBox({
  expectedName,
  date,
  doc = "agreement",
  signed = null,
  prompt = "Type your full name to sign this agreement.",
  button = "Sign",
  done = "Signed",
}: {
  expectedName: string;
  date: string;
  doc?: "agreement" | "booking";
  signed?: { name: string; date: string } | null;
  prompt?: string;
  button?: string;
  done?: string;
}) {
  const [state, action, pending] = useActionState(signAgreement, undefined);

  if (signed || state?.ok) {
    return (
      <p className="bg-emerald-600/10 px-4 py-3 text-sm text-emerald-800">
        {done} by {signed?.name ?? expectedName} on {signed?.date ?? date}.
      </p>
    );
  }

  return (
    <form action={action} className="border border-[var(--line)] bg-mist p-5">
      <input type="hidden" name="doc" value={doc} />
      <p className="text-sm text-ink">{prompt}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <input
          name="name"
          placeholder={expectedName}
          className="flex-1 border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/50 focus:border-copper"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-2.5 text-sm font-medium text-mist transition hover:bg-ink-soft disabled:opacity-40"
        >
          {pending ? "Saving…" : button}
        </button>
      </div>
      {state?.error && <p className="mt-3 bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}
    </form>
  );
}
