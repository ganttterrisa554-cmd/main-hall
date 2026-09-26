import Link from "next/link";
import { formatLong } from "@/data/admin";
import { getTeamMember } from "@/data/team";
import { listEvents, listPeople } from "@/lib/repo";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const [events, people] = await Promise.all([listEvents(), listPeople()]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Events</h1>
          <p className="mt-2 text-muted">Upcoming events and the roles you need to fill.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="bg-copper px-5 py-3 text-sm font-medium text-mist transition hover:bg-copper-bright"
        >
          + New event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="mt-10 text-muted">No events yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {events.map((event) => {
            const onIt = people.filter((p) => p.eventId === event.id && p.stage !== "declined");
            const booked = onIt.filter((p) => p.stage === "booked").length;
            return (
              <li key={event.id}>
                <Link
                  href={`/admin/events/${event.id}`}
                  className="grid gap-2 py-5 transition hover:bg-stone/40 sm:grid-cols-[1fr_auto] sm:items-center sm:px-2"
                >
                  <div>
                    <p className="font-display text-lg text-ink">
                      {event.client} · {event.name}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {formatLong(event.date)} · {event.venue}, {event.city}, {event.state} · {event.guests} guests
                    </p>
                  </div>
                  <div className="text-sm sm:text-right">
                    <p className="text-ink">
                      {booked} of {event.roles.length} role{event.roles.length === 1 ? "" : "s"} booked
                    </p>
                    <p className="mt-0.5 text-muted">
                      {onIt.length} in progress · {getTeamMember(event.producerId)?.name ?? "No producer"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
