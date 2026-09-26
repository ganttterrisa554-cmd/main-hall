import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplyBox } from "@/components/admin/inbox/ReplyBox";
import { formatDateTime } from "@/data/admin";
import { getThread, markThreadRead, mailSettings } from "@/lib/mail";
import { getPerson } from "@/lib/repo";

export const metadata = { title: "Email" };

export default async function ThreadPage({ params }: { params: Promise<{ thread: string }> }) {
  const { thread } = await params;
  const messages = await getThread(thread);
  if (messages.length === 0) notFound();
  await markThreadRead(thread);

  const ourAddress = mailSettings().address;
  const personId = messages.find((m) => m.personId)?.personId ?? null;
  const person = personId ? await getPerson(personId) : null;
  const lastIncoming = [...messages].reverse().find((m) => m.direction === "in");
  const replyTo =
    lastIncoming?.fromAddr ?? messages[messages.length - 1].toAddrs.find((a) => a !== ourAddress) ?? "";
  const subject = messages[0].subject;

  return (
    <div>
      <Link href="/admin/inbox" className="text-sm text-muted transition hover:text-copper">
        ← Inbox
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{subject || "(no subject)"}</h1>
        {person && (
          <Link href={`/admin/people/${person.id}`} className="text-sm text-copper">
            {person.name}&apos;s profile →
          </Link>
        )}
      </div>

      <ol className="mt-8 space-y-4">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`border border-[var(--line)] p-5 ${m.direction === "out" ? "bg-white" : "bg-stone/40"}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <p>
                <span className="font-medium text-ink">
                  {m.direction === "out" ? `${m.fromName || "Main Hall"} (you)` : m.fromName || m.fromAddr}
                </span>
                <span className="text-muted">
                  {m.direction === "out" ? ` to ${m.toAddrs.join(", ")}` : ` <${m.fromAddr}>`}
                </span>
              </p>
              <p className="text-xs text-muted">
                {formatDateTime(m.createdAt)}
                {m.status === "not_sent" && <span className="ml-2 text-copper">Saved, not sent</span>}
                {m.status === "failed" && <span className="ml-2 text-red-700">Failed</span>}
              </p>
            </div>
            {m.error && m.status !== "sent" && <p className="mt-2 text-xs text-muted">{m.error}</p>}
            {m.textBody ? (
              <pre className="mt-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink">{m.textBody}</pre>
            ) : m.htmlBody ? (
              <iframe
                title={`Email from ${m.fromAddr}`}
                sandbox=""
                srcDoc={m.htmlBody}
                className="mt-4 h-96 w-full border-0 bg-white"
              />
            ) : (
              <p className="mt-4 text-sm text-muted">(empty message)</p>
            )}
          </li>
        ))}
      </ol>

      {replyTo && <ReplyBox threadId={thread} to={replyTo} subject={subject} personId={personId} />}
    </div>
  );
}
