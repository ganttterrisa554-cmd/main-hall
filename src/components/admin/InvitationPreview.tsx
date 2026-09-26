"use client";

import { CopyButton } from "@/components/admin/CopyButton";

export function InvitationPreview({
  subject,
  body,
  email,
}: {
  subject: string;
  body: string;
  email?: string;
}) {
  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null;

  return (
    <div className="border border-[var(--line)] bg-white">
      <div className="border-b border-[var(--line)] px-5 py-3">
        <p className="text-xs text-muted">Subject</p>
        <p className="mt-0.5 text-sm font-medium text-ink">{subject}</p>
      </div>
      <pre className="px-5 py-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink">
        {body}
      </pre>
      <div className="flex flex-wrap gap-3 border-t border-[var(--line)] px-5 py-3">
        <CopyButton text={`${subject}\n\n${body}`} />
        {mailto && (
          <a
            href={mailto}
            className="border border-ink/20 px-4 py-2 text-sm text-ink transition hover:border-ink"
          >
            Open in email
          </a>
        )}
      </div>
    </div>
  );
}
