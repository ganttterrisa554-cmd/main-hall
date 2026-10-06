import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDateTime, formatLong, formatMoney, formatShort, getRole } from "@/data/admin";
import { getTeamMember } from "@/data/team";
import { requirePartner } from "@/lib/auth";
import { pickCurrentJob } from "@/lib/partnerPack";
import { getEvent, getPartnerDetails, getSignature, listJobsForPerson } from "@/lib/repo";

const statusLabel = {
  requested: "Quote needed",
  submitted: "Quote sent",
  accepted: "Booked",
  declined: "Not going ahead",
} as const;

type ChecklistItem = {
  label: string;
  href: string;
  done: boolean;
  status: string;
};

function ChecklistRow({ item }: { item: ChecklistItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className="flex items-center justify-between gap-4 py-4 transition hover:bg-stone/40 sm:px-2"
      >
        <span className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${item.done ? "bg-copper" : "border border-muted"}`}
          />
          <span className="text-ink">{item.label}</span>
        </span>
        <span className={`text-sm ${item.done ? "text-muted" : "text-copper"}`}>{item.status}</span>
      </Link>
    </li>
  );
}

export default async function PartnerHome() {
  const user = await requirePartner();
  if (user.mustChangePassword) redirect("/partners/password");

  const jobs = user.personId ? await listJobsForPerson(user.personId) : [];
  const withEvents = await Promise.all(jobs.map(async (job) => ({ job, event: await getEvent(job.eventId) })));
  const first = user.name.split(" ")[0];
  const needsQuote = jobs.filter((j) => j.quoteStatus === "requested");
  const current = pickCurrentJob(jobs);

  const [signature, details] = user.personId
    ? await Promise.all([getSignature(user.personId, "agreement"), getPartnerDetails(user.personId)])
    : [null, null];

  const checklist: ChecklistItem[] = [
    {
      label: "Read the event brief",
      href: "/partners/pack/brief",
      done: false,
      status: "Read it",
    },
    {
      label: "Send your quote",
      href: current ? `/partners/jobs/${current.id}` : "/partners",
      done: jobs.some((j) => j.quoteStatus !== "requested"),
      status: current ? `Due ${formatShort(current.quoteDue)}` : "",
    },
    {
      label: "Sign the contractor agreement",
      href: "/partners/pack/agreement",
      done: Boolean(signature),
      status: signature ? `Signed ${formatDateTime(signature.signedAt)}` : "Sign online",
    },
    {
      label: "Add your tax form and payment details",
      href: "/partners/details",
      done: Boolean(details?.w9Filename && details?.payLast4),
      status: details?.w9Filename
        ? details.payLast4
          ? "Done"
          : "W-9 uploaded"
        : details?.payLast4
          ? "Payment details added"
          : "Two short steps",
    },
  ];
  const pending = checklist.slice(1).filter((item) => !item.done).length;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Hi {first}</h1>
      <p className="mt-2 text-muted">
        {jobs.length === 0
          ? needsQuote.length
            ? `We need your quote for ${needsQuote.length === 1 ? "one job" : `${needsQuote.length} jobs`}.`
            : "You're all caught up."
          : pending === 0
            ? "You're all set."
            : `${pending} thing${pending === 1 ? "" : "s"} to do before the event.`}
      </p>

      {jobs.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl text-ink">Your checklist</h2>
          <ul className="mt-2 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {checklist.map((item) => (
              <ChecklistRow key={item.label} item={item} />
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">Your jobs</h2>
        {withEvents.length === 0 ? (
          <p className="mt-3 text-muted">No jobs yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {withEvents.map(({ job, event }) => {
              const role = getRole(event, job.roleId);
              const producer = event ? getTeamMember(event.producerId) : undefined;
              return (
                <li key={job.id}>
                  <Link
                    href={`/partners/jobs/${job.id}`}
                    className="block border border-[var(--line)] bg-white p-5 transition hover:border-copper"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs tracking-[0.14em] text-copper uppercase">{role?.title}</p>
                        <p className="font-display mt-1 text-xl text-ink">
                          {event?.client} · {event?.name}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {event ? `${formatLong(event.date)} · ${event.venue}, ${event.city}` : ""}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs ${
                          job.quoteStatus === "requested"
                            ? "bg-copper text-mist"
                            : job.quoteStatus === "accepted"
                              ? "bg-emerald-600/15 text-emerald-900"
                              : "bg-ink/5 text-muted"
                        }`}
                      >
                        {statusLabel[job.quoteStatus]}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-ink">
                      {job.quoteStatus === "requested"
                        ? `Send your quote by ${formatShort(job.quoteDue)} →`
                        : job.quoteAmount
                          ? `Your quote: ${formatMoney(job.quoteAmount)}`
                          : ""}
                    </p>
                    {producer && (
                      <p className="mt-2 text-xs text-muted">Your Main Hall contact: {producer.name}</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">Your documents</h2>
        <Link
          href="/partners/pack"
          className="mt-4 flex items-center justify-between border border-[var(--line)] bg-white p-5 transition hover:border-copper"
        >
          <span>
            <span className="block text-ink">Event brief, quote form, agreement, and on-site guide</span>
            <span className="mt-1 block text-sm text-muted">Read, print, or save as PDF</span>
          </span>
          <span className="text-copper">→</span>
        </Link>
        <div className="mt-6 flex items-center gap-6 text-sm">
          <Link href="/partners/details" className="text-muted hover:text-ink">
            Your details
          </Link>
          <Link href="/partners/password" className="text-muted hover:text-ink">
            Change password
          </Link>
        </div>
      </section>
    </div>
  );
}
