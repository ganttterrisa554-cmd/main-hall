import Link from "next/link";
import { notFound } from "next/navigation";
import { formatLong, stageInfo } from "@/data/admin";
import { getTeamMember } from "@/data/team";
import { getEvent, listPeople } from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const event = await getEvent((await params).id);
  return { title: event ? `${event.client} · ${event.name}` : "Event" };
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [event, people] = await Promise.all([getEvent(id), listPeople()]);
  if (!event) notFound();
  const producer = getTeamMember(event.producerId);
  const onEvent = people.filter((p) => p.eventId === event.id);

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-muted transition hover:text-copper">
        ← Events
      </Link>

      {created && (
        <p className="mt-6 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-900">
          Event saved. Now add people for each role.
        </p>
      )}

      <h1 className="font-display mt-6 text-3xl text-ink sm:text-4xl">
        {event.client} · {event.name}
      </h1>
      <p className="mt-2 text-muted">
        {formatLong(event.date)} · {event.venue}, {event.city}, {event.state} · {event.guests} guests
      </p>

      <dl className="mt-8 grid gap-5 border-y border-[var(--line)] py-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted">Producer</dt>
          <dd className="mt-1 text-ink">{producer?.name ?? "Not set"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Partners arrive</dt>
          <dd className="mt-1 text-ink">{event.arriveTime || "Not set"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Address</dt>
          <dd className="mt-1 text-ink">{event.address || `${event.city}, ${event.state}`}</dd>
        </div>
      </dl>

      <h2 className="font-display mt-10 text-xl text-ink">Roles</h2>
      <ul className="mt-4 space-y-4">
        {event.roles.map((role) => {
          const candidates = onEvent.filter((p) => p.roleId === role.id);
          return (
            <li key={role.id} className="border border-[var(--line)] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{role.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{role.brief}</p>
                </div>
                <Link
                  href={`/admin/new?event=${event.id}&role=${role.id}`}
                  className="border border-ink/20 px-3 py-1.5 text-sm text-ink transition hover:border-ink"
                >
                  + Add person
                </Link>
              </div>
              {candidates.length > 0 ? (
                <ul className="mt-4 space-y-1.5 text-sm">
                  {candidates.map((p) => (
                    <li key={p.id} className="flex justify-between gap-4">
                      <Link href={`/admin/people/${p.id}`} className="text-ink hover:text-copper">
                        {p.name}
                      </Link>
                      <span className="text-muted">{stageInfo(p.stage).label}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">Nobody yet.</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
