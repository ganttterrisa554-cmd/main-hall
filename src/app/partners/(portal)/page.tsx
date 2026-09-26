import Link from "next/link";
import { redirect } from "next/navigation";
import { formatLong, formatMoney, formatShort, getRole } from "@/data/admin";
import { getTeamMember } from "@/data/team";
import { requirePartner } from "@/lib/auth";
import { getEvent, listJobsForPerson } from "@/lib/repo";

const statusLabel = {
  requested: "Quote needed",
  submitted: "Quote sent",
  accepted: "Booked",
  declined: "Not going ahead",
} as const;

export default async function PartnerHome() {
  const user = await requirePartner();
  if (user.mustChangePassword) redirect("/partners/password");

  const jobs = user.personId ? await listJobsForPerson(user.personId) : [];
  const withEvents = await Promise.all(jobs.map(async (job) => ({ job, event: await getEvent(job.eventId) })));
  const first = user.name.split(" ")[0];
  const needsQuote = jobs.filter((j) => j.quoteStatus === "requested");

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Hi {first}</h1>
      <p className="mt-2 text-muted">
        {needsQuote.length
          ? `We need your quote for ${needsQuote.length === 1 ? "one job" : `${needsQuote.length} jobs`}.`
          : "You're all caught up."}
      </p>

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
        <Link href="/partners/password" className="mt-6 inline-block text-sm text-muted hover:text-ink">
          Change password
        </Link>
      </section>
    </div>
  );
}
