"use client";

import { useActionState } from "react";
import { savePaymentDetails, uploadW9 } from "@/app/partners/actions";

const inputClass =
  "mt-1.5 w-full border border-[var(--line)] bg-white px-3 py-3 text-ink outline-none transition placeholder:text-muted/50 focus:border-copper";

const buttonClass =
  "bg-copper px-6 py-3 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-50";

export function W9Form({ label }: { label: string }) {
  const [state, action, pending] = useActionState(uploadW9, undefined);

  if (state?.ok) {
    return <p className="mt-4 bg-emerald-600/10 px-4 py-3 text-emerald-900">{state.ok}</p>;
  }

  return (
    <form action={action} className="mt-4 space-y-4">
      <label className="block">
        <span className="text-sm text-ink">W-9 file (PDF, JPG, or PNG — under 5 MB)</span>
        <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required className="mt-1.5 block text-sm text-ink" />
      </label>
      {state?.error && <p className="bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Uploading…" : label}
      </button>
    </form>
  );
}

export function PaymentForm({ label }: { label: string }) {
  const [state, action, pending] = useActionState(savePaymentDetails, undefined);

  if (state?.ok) {
    return <p className="mt-4 bg-emerald-600/10 px-4 py-3 text-emerald-900">{state.ok}</p>;
  }

  return (
    <form action={action} className="mt-4 space-y-4">
      <label className="block">
        <span className="text-sm text-ink">Account holder name</span>
        <input name="accountName" required autoComplete="off" className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm text-ink">Bank name</span>
        <input name="bank" required autoComplete="off" className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm text-ink">Routing number</span>
        <input name="routing" inputMode="numeric" required autoComplete="off" className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm text-ink">Account number</span>
        <input name="account" inputMode="numeric" required autoComplete="off" className={inputClass} />
      </label>
      <p className="text-xs text-muted">Encrypted and only used to pay you by direct deposit.</p>
      {state?.error && <p className="bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : label}
      </button>
    </form>
  );
}
