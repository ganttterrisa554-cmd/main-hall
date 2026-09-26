"use client";

import { useActionState, useEffect, useRef } from "react";
import { replyToThread } from "@/app/admin/actions";

export function ReplyBox({
  threadId,
  to,
  subject,
  personId,
}: {
  threadId: string;
  to: string;
  subject: string;
  personId: string | null;
}) {
  const [state, action, pending] = useActionState(replyToThread, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-8 border border-[var(--line)] bg-white p-5">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="to" value={to} />
      <input type="hidden" name="subject" value={subject} />
      <input type="hidden" name="personId" value={personId ?? ""} />
      <p className="text-sm text-muted">Reply to {to}</p>
      <textarea
        name="body"
        rows={6}
        required
        className="mt-3 w-full resize-y border border-[var(--line)] px-3 py-3 text-sm text-ink outline-none focus:border-copper"
        placeholder="Write your reply…"
      />
      {state?.error && <p className="mt-3 bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      {state?.ok && <p className="mt-3 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-900">{state.ok}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 bg-copper px-5 py-3 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}
