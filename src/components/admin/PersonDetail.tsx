"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  acceptQuote,
  declineQuote,
  markAgreed,
  moveStage,
  sendInvitation,
} from "@/app/admin/actions";
import type { AgreedResult } from "@/lib/partnerFlow";
import { CopyButton } from "@/components/admin/CopyButton";
import { InvitationPreview } from "@/components/admin/InvitationPreview";
import {
  buildInvitation,
  formatDateTime,
  formatLong,
  formatMoney,
  formatShort,
  getRole,
  pipelineStages,
  stageInfo,
  type Job,
  type Prospect,
  type StaffEvent,
} from "@/data/admin";
import type { TeamMember } from "@/data/team";
import type { EmailMessage } from "@/lib/mail";

const primary =
  "bg-copper px-5 py-3 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-40";
const secondary =
  "border border-ink/20 px-5 py-3 text-sm text-ink transition hover:border-ink disabled:opacity-40";

function Notice({ tone, children }: { tone: "ok" | "warn" | "error"; children: React.ReactNode }) {
  const styles = {
    ok: "bg-emerald-600/10 text-emerald-900",
    warn: "bg-amber-500/15 text-ink",
    error: "bg-red-600/10 text-red-800",
  }[tone];
  return <div className={`px-4 py-3 text-sm leading-relaxed ${styles}`}>{children}</div>;
}

function AgreedPanel({ result }: { result: AgreedResult }) {
  return (
    <div className="space-y-4 border border-[var(--line)] bg-white p-5">
      <p className="font-display text-lg text-ink">Their job is set up</p>

      <div>
        <p className="text-xs text-muted">Job link (quote request is on this page)</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <a href={result.jobUrl} target="_blank" rel="noreferrer" className="break-all text-copper">
            {result.jobUrl}
          </a>
          <CopyButton text={result.jobUrl ?? ""} label="Copy link" />
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted">Login</p>
          <p className="text-ink">{result.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Temporary password (shown once)</p>
          <p className="font-mono text-ink">{result.tempPassword}</p>
        </div>
      </div>

      {result.emailStatus === "sent" ? (
        <Notice tone="ok">Emailed to {result.email} with the job link, quote request, and login.</Notice>
      ) : (
        <>
          <Notice tone="warn">Not emailed: {result.emailError}</Notice>
          <InvitationPreview subject={result.subject ?? ""} body={result.body ?? ""} email={result.email} />
        </>
      )}
    </div>
  );
}

function NextStep({ person, event, job }: { person: Prospect; event: StaffEvent | null; job: Job | null }) {
  const [pending, startTransition] = useTransition();
  const [agreed, setAgreed] = useState<AgreedResult | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const invitation = buildInvitation(person, event);

  const safely = (fn: () => Promise<void>) =>
    startTransition(async () => {
      try {
        await fn();
      } catch {
        setMessage({ tone: "error", text: "That didn't go through. Check your connection and try again." });
      }
    });

  const run = (fn: () => Promise<unknown>) =>
    safely(async () => {
      setMessage(null);
      await fn();
    });

  const setUp = () =>
    safely(async () => {
      setMessage(null);
      const result = await markAgreed(person.id);
      if (result.error) setMessage({ tone: "error", text: result.error });
      else setAgreed(result);
    });

  if (agreed) return <AgreedPanel result={agreed} />;

  const error = message && <Notice tone={message.tone === "ok" ? "ok" : "error"}>{message.text}</Notice>;

  switch (person.stage) {
    case "found":
      return (
        <div className="space-y-5">
          <InvitationPreview subject={invitation.subject} body={invitation.body} email={person.email} />
          {error}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={primary}
              disabled={pending || !person.email}
              onClick={() =>
                safely(async () => {
                  const result = await sendInvitation(person.id);
                  setMessage(result?.error ? { tone: "error", text: result.error } : null);
                })
              }
            >
              {pending ? "Sending…" : "Send invitation"}
            </button>
            <button
              type="button"
              className={secondary}
              disabled={pending}
              onClick={() => run(() => moveStage(person.id, "invited", "Invitation sent"))}
            >
              I sent it myself
            </button>
          </div>
        </div>
      );

    case "invited":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            When they say yes, one click creates their job page, quote request, and partner login, and emails
            them everything.
          </p>
          {error}
          <div className="flex flex-wrap gap-3">
            <button type="button" className={primary} disabled={pending} onClick={setUp}>
              {pending ? "Setting up…" : "They said yes"}
            </button>
            <button
              type="button"
              className={secondary}
              disabled={pending}
              onClick={() => run(() => moveStage(person.id, "declined", "Not interested"))}
            >
              Not interested
            </button>
          </div>
        </div>
      );

    case "agreed":
      return (
        <div className="space-y-4">
          {job ? (
            <p className="text-sm text-ink">
              Quote requested, due <strong>{formatShort(job.quoteDue)}</strong>. You&apos;ll see it here as soon as
              they send it from their portal.
            </p>
          ) : (
            <p className="text-sm text-muted">They said yes, but their job and login haven&apos;t been set up yet.</p>
          )}
          {error}
          <button type="button" className={job ? secondary : primary} disabled={pending} onClick={setUp}>
            {pending ? "Working…" : job ? "Resend login (new password)" : "Set up job & send login"}
          </button>
        </div>
      );

    case "quoted":
      return (
        <div className="space-y-4">
          <div className="border border-[var(--line)] bg-white p-5">
            <p className="font-display text-3xl text-ink">{formatMoney(job?.quoteAmount ?? 0)}</p>
            {job?.quoteIncludes && (
              <p className="mt-3 text-sm text-ink">
                <span className="text-muted">Includes:</span> {job.quoteIncludes}
              </p>
            )}
            {job?.quoteNotes && (
              <p className="mt-2 text-sm text-ink">
                <span className="text-muted">Notes:</span> {job.quoteNotes}
              </p>
            )}
            {job?.quoteSubmittedAt && (
              <p className="mt-3 text-xs text-muted">Sent {formatDateTime(job.quoteSubmittedAt)}</p>
            )}
          </div>
          {error}
          <div className="flex flex-wrap gap-3">
            <button type="button" className={primary} disabled={pending} onClick={() => run(() => acceptQuote(person.id))}>
              Accept & book
            </button>
            <button type="button" className={secondary} disabled={pending} onClick={() => run(() => declineQuote(person.id))}>
              Not going ahead
            </button>
          </div>
        </div>
      );

    case "booked":
      return (
        <p className="text-ink">
          Booked{job?.quoteAmount ? ` at ${formatMoney(job.quoteAmount)}` : ""}.{" "}
          <Link href="/partners/pack/booking" className="text-copper">
            See the booking confirmation template →
          </Link>
        </p>
      );

    case "declined":
      return (
        <button
          type="button"
          className={secondary}
          disabled={pending}
          onClick={() => run(() => moveStage(person.id, "found", "Moved back to Found"))}
        >
          Move back to Found
        </button>
      );
  }
}

export function PersonDetail({
  person,
  event,
  job,
  jobUrl,
  producer,
  emails,
}: {
  person: Prospect;
  event: StaffEvent | null;
  job: Job | null;
  jobUrl: string | null;
  producer: Pick<TeamMember, "id" | "name" | "photo"> | null;
  emails: EmailMessage[];
}) {
  const role = getRole(event, person.roleId);
  const current = pipelineStages.findIndex((s) => s.key === person.stage);

  return (
    <div>
      <Link href="/admin" className="text-sm text-muted transition hover:text-copper">
        ← People
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{person.name}</h1>
          <p className="mt-2 text-muted">
            {person.headline} · {person.city}
          </p>
        </div>
        {person.email && (
          <Link href={`/admin/inbox/new?person=${person.id}`} className={secondary}>
            Email {person.name.split(" ")[0]}
          </Link>
        )}
      </div>

      <ol className="mt-8 flex gap-1 overflow-x-auto">
        {pipelineStages.map((stage, i) => (
          <li
            key={stage.key}
            className={`flex-1 whitespace-nowrap px-3 py-2 text-center text-xs ${
              person.stage === "declined"
                ? "bg-ink/5 text-muted"
                : i < current
                  ? "bg-copper/15 text-copper"
                  : i === current
                    ? "bg-ink text-mist"
                    : "bg-ink/5 text-muted"
            }`}
          >
            {stage.label}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="font-display text-xl text-ink">Next step</h2>
          <p className="mt-1 text-sm text-muted">{stageInfo(person.stage).next}</p>
          <div className="mt-5">
            <NextStep person={person} event={event} job={job} />
          </div>

          {emails.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-xl text-ink">Emails</h2>
              <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {emails.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/admin/inbox/${m.threadId}`}
                      className="flex items-baseline justify-between gap-4 py-3 text-sm transition hover:bg-stone/40 sm:px-2"
                    >
                      <span className="min-w-0">
                        <span className="mr-2 text-xs text-muted">{m.direction === "in" ? "From them" : "To them"}</span>
                        <span className="text-ink">{m.subject || "(no subject)"}</span>
                        {m.status === "not_sent" && <span className="ml-2 text-xs text-copper">not sent</span>}
                        {m.status === "failed" && <span className="ml-2 text-xs text-red-700">failed</span>}
                      </span>
                      <span className="shrink-0 text-xs text-muted">{formatDateTime(m.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="space-y-8 text-sm">
          <div>
            <h3 className="font-display text-base text-ink">Job</h3>
            <p className="mt-2 text-ink">{role?.title ?? "No role"}</p>
            {event ? (
              <p className="text-muted">
                <Link href={`/admin/events/${event.id}`} className="hover:text-copper">
                  {event.client} · {event.name}
                </Link>
                <br />
                {formatLong(event.date)} · {event.venue}, {event.city}
              </p>
            ) : (
              <p className="text-muted">No event</p>
            )}
            {jobUrl && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a href={jobUrl} target="_blank" rel="noreferrer" className="break-all text-copper">
                  Their job page ↗
                </a>
                <CopyButton text={jobUrl} label="Copy link" />
              </div>
            )}
            {person.hasLogin && <p className="mt-2 text-xs text-muted">Has a partner login</p>}
            {producer && (
              <Link href={`/admin/team#${producer.id}`} className="mt-3 flex items-center gap-3">
                <Image
                  src={producer.photo}
                  alt={producer.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <span>
                  <span className="block text-ink">{producer.name}</span>
                  <span className="block text-xs text-muted">Producer for this event</span>
                </span>
              </Link>
            )}
          </div>
          <div>
            <h3 className="font-display text-base text-ink">Contact</h3>
            <p className="mt-2">
              {person.email ? (
                <span className="text-ink">{person.email}</span>
              ) : (
                <span className="text-muted">No email</span>
              )}
            </p>
            <p className="mt-1 text-ink">{person.phone}</p>
            {person.jobgetUrl && (
              <a href={person.jobgetUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-copper">
                JobGet profile ↗
              </a>
            )}
          </div>
          {person.highlights.length > 0 && (
            <div>
              <h3 className="font-display text-base text-ink">Why them</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-ink">
                {person.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {person.notes && (
            <div>
              <h3 className="font-display text-base text-ink">Notes</h3>
              <p className="mt-2 bg-amber-500/10 px-3 py-2 leading-relaxed text-ink">{person.notes}</p>
            </div>
          )}
          <div>
            <h3 className="font-display text-base text-ink">History</h3>
            <ul className="mt-2 space-y-1.5">
              {[...person.activity].reverse().map((a, i) => (
                <li key={`${a.at}-${i}`} className="flex gap-3">
                  <span className="w-12 shrink-0 text-muted">{formatShort(a.at)}</span>
                  <span className="text-ink">{a.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
