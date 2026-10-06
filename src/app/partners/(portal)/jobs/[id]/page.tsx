import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuoteForm } from "@/components/partners/QuoteForm";
import { QuoteSentModal } from "@/components/partners/QuoteSentModal";
import { formatDateTime, formatLong, formatMoney, getRole } from "@/data/admin";
import { company } from "@/data/company";
import { getTeamMember } from "@/data/team";
import { requirePartner } from "@/lib/auth";
import { getEvent, getJob } from "@/lib/repo";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Your job" };

const JUST_SUBMITTED_MS = 120_000;
function justSubmitted(iso: string | null) {
  return iso ? Date.now() - new Date(iso).getTime() < JUST_SUBMITTED_MS : false;
}

export default async function PartnerJobPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requirePartner();
  if (user.mustChangePassword) redirect(`/partners/password?next=/partners/jobs/${id}`);

  const job = await getJob(id);
  if (!job || job.personId !== user.personId) notFound();
  const event = await getEvent(job.eventId);
  if (!event) notFound();
  const role = getRole(event, job.roleId);
  const producer = getTeamMember(event.producerId);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.address || `${event.venue}, ${event.city}, ${event.state}`,
  )}`;

  return (
    <div>
      <Link href="/partners" className="text-sm text-muted transition hover:text-copper">
        ← Your jobs
      </Link>

      <p className="mt-8 text-xs tracking-[0.18em] text-copper uppercase">{role?.title}</p>
      <h1 className="font-display mt-2 text-3xl leading-tight text-ink sm:text-4xl">
        {event.client} · {event.name}
      </h1>

      <dl className="mt-8 grid gap-5 border-y border-[var(--line)] py-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted">Date</dt>
          <dd className="mt-1 text-ink">{formatLong(event.date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Arrive by</dt>
          <dd className="mt-1 text-ink">{event.arriveTime || "We'll confirm"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Venue</dt>
          <dd className="mt-1 text-ink">
            {event.venue}
            <br />
            <a href={mapHref} target="_blank" rel="noreferrer" className="text-sm text-copper">
              {event.address || `${event.city}, ${event.state}`} ↗
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Guests</dt>
          <dd className="mt-1 text-ink">About {event.guests}</dd>
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">What we need</h2>
        <p className="mt-2 leading-relaxed text-ink">
          {role?.brief ? role.brief.charAt(0).toUpperCase() + role.brief.slice(1) : ""}.
        </p>
      </section>

      <section className="mt-10 border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="font-display text-xl text-ink">Your quote</h2>
        {job.quoteStatus === "requested" ? (
          <>
            <p className="mt-1 text-sm text-muted">Please send it by {formatLong(job.quoteDue)}.</p>
            <QuoteForm jobId={job.id} />
          </>
        ) : (
          <div className="mt-3 space-y-2 text-ink">
            <p>
              <span className="font-display text-2xl">{formatMoney(job.quoteAmount ?? 0)}</span>
              <span className="ml-3 text-sm text-muted">
                {job.quoteStatus === "submitted" && "Sent, we'll reply within two business days"}
                {job.quoteStatus === "accepted" && "Accepted. You're booked!"}
                {job.quoteStatus === "declined" && "Not going ahead this time"}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted">Includes:</span> {job.quoteIncludes}
            </p>
            {job.quoteNotes && (
              <p className="text-sm">
                <span className="text-muted">Notes:</span> {job.quoteNotes}
              </p>
            )}
            {job.quoteSubmittedAt && (
              <p className="text-xs text-muted">Sent {formatDateTime(job.quoteSubmittedAt)}</p>
            )}
          </div>
        )}
        {justSubmitted(job.quoteSubmittedAt) && <QuoteSentModal />}
      </section>

      <Link
        href="/partners/pack"
        className="mt-10 flex items-center justify-between border border-[var(--line)] bg-white p-5 transition hover:border-copper"
      >
        <span>
          <span className="block text-ink">Your documents</span>
          <span className="mt-1 block text-sm text-muted">Event brief, agreement, and on-site guide</span>
        </span>
        <span className="text-copper">→</span>
      </Link>
      <p className="mt-4 text-sm">
        <Link href="/partners/details" className="text-copper">
          Your details (W-9 & payment) →
        </Link>
      </p>

      <section className="mt-10 text-sm">
        <h2 className="font-display text-xl text-ink">Your contact</h2>
        <p className="mt-2 text-ink">
          {producer ? `${producer.name}, ${producer.role}` : "The Main Hall team"}
          <br />
          <a href={company.phoneHref} className="text-copper">
            {company.phone}
          </a>
        </p>
      </section>
    </div>
  );
}
