import { notFound } from "next/navigation";
import { ChatReplyBox } from "@/components/admin/ChatReplyBox";
import { PersonDetail } from "@/components/admin/PersonDetail";
import { formatDateTime } from "@/data/admin";
import { getTeamMember } from "@/data/team";
import { listEmailsForPerson } from "@/lib/mail";
import { siteOrigin } from "@/lib/origin";
import {
  getEvent,
  getJobForPerson,
  getPartnerDetails,
  getPerson,
  getSignature,
  listChatMessages,
  markChatRead,
} from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const person = await getPerson((await params).id);
  return { title: person?.name ?? "Person" };
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  await markChatRead(person.id, "in");
  const [event, job, emails, origin, signature, details, chat] = await Promise.all([
    person.eventId ? getEvent(person.eventId) : null,
    getJobForPerson(person.id),
    listEmailsForPerson(person.id),
    siteOrigin(),
    getSignature(person.id, "agreement"),
    getPartnerDetails(person.id),
    listChatMessages(person.id),
  ]);

  const member = event ? getTeamMember(event.producerId) : undefined;

  return (
    <>
      <PersonDetail
      person={person}
      event={event}
      job={job}
      jobUrl={job ? `${origin}/partners/jobs/${job.id}` : null}
      producer={member ? { id: member.id, name: member.name, photo: member.photo } : null}
      emails={emails}
    />
      <section className="mt-8 border border-[var(--line)] bg-white p-5">
        <h2 className="font-display text-lg text-ink">Partner details</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted">Agreement</dt>
            <dd className="text-ink">
              {signature
                ? `Signed ${formatDateTime(signature.signedAt)} by ${signature.signedName}`
                : "Not signed"}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted">W-9</dt>
            <dd className="text-ink">
              {details?.w9Filename ? (
                <>
                  {details.w9Filename}
                  {details.w9UploadedAt && `, uploaded ${formatDateTime(details.w9UploadedAt)}`}{" "}
                  <a href={`/admin/w9/${person.id}`} className="text-copper">
                    Download
                  </a>
                </>
              ) : (
                "Not uploaded"
              )}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted">Payment</dt>
            <dd className="text-ink">
              {details?.payLast4 ? `${details.payBank} · ending ${details.payLast4}` : "Not added"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 border border-[var(--line)] bg-white p-5">
        <h2 className="font-display text-lg text-ink">Chat</h2>
        {chat.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No messages yet.</p>
        ) : (
          <ol className="mt-4 space-y-4">
            {chat.map((m) => (
              <li key={m.id} className={m.direction === "out" ? "bg-stone/40 p-3" : "p-3"}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-medium text-ink">
                    {m.direction === "in" ? person.name : `${m.authorName || "Main Hall"} (you)`}
                  </p>
                  <p className="text-xs text-muted">{formatDateTime(m.createdAt)}</p>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap text-ink">{m.body}</p>
              </li>
            ))}
          </ol>
        )}
        <ChatReplyBox personId={person.id} />
      </section>
    </>
  );
}
