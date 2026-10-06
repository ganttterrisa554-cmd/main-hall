"use client";

import { useActionState } from "react";
import { sendQuote } from "@/app/partners/actions";

const inputClass =
  "mt-1.5 w-full border border-[var(--line)] bg-white px-3 py-3 text-ink outline-none transition placeholder:text-muted/50 focus:border-copper";

export function QuoteForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(sendQuote, undefined);

  if (state?.ok) {
    return <p className="mt-4 bg-emerald-600/10 px-4 py-3 text-emerald-900">{state.ok}</p>;
  }

  return (
    <form action={action} className="mt-5 space-y-5">
      <input type="hidden" name="jobId" value={jobId} />
      <label className="block">
        <span className="text-sm text-ink">Your total price (USD)</span>
        <div className="mt-1.5 flex items-center border border-[var(--line)] bg-white focus-within:border-copper">
          <span className="pl-3 text-muted">$</span>
          <input
            name="amount"
            inputMode="decimal"
            required
            placeholder="2,400"
            className="w-full bg-transparent px-2 py-3 text-ink outline-none placeholder:text-muted/50"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-sm text-ink">What&apos;s included</span>
        <textarea
          name="includes"
          rows={3}
          required
          placeholder="Hours on site, equipment you bring, crew, travel…"
          className={`${inputClass} resize-none`}
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink">Your phone number</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          required
          placeholder="(646) 555-0134"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink">Anything else?</span>
        <span className="ml-2 text-xs text-muted">optional</span>
        <textarea
          name="notes"
          rows={2}
          placeholder="Questions, availability, what you need from us"
          className={`${inputClass} resize-none`}
        />
      </label>
      {state?.error && <p className="bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-copper px-6 py-3.5 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send my quote"}
      </button>
    </form>
  );
}
