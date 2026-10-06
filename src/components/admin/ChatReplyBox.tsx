"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendAdminChatMessage } from "@/app/admin/actions";

export function ChatReplyBox({ personId }: { personId: string }) {
  const [state, action, pending] = useActionState(sendAdminChatMessage, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-4">
      <input type="hidden" name="personId" value={personId} />
      <textarea
        name="body"
        rows={3}
        required
        maxLength={2000}
        className="w-full resize-y border border-[var(--line)] px-3 py-3 text-sm text-ink outline-none focus:border-copper"
        placeholder="Reply in the portal — they'll see it when they open chat"
      />
      {state?.error && <p className="mt-2 bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      {state?.ok && <p className="mt-2 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-900">{state.ok}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 bg-copper px-5 py-3 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send to portal"}
      </button>
    </form>
  );
}
