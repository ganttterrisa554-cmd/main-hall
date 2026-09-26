import Link from "next/link";
import { TeamSection } from "@/components/admin/TeamSection";
import { getRole, stages, type Prospect, type StaffEvent } from "@/data/admin";

export function PeopleList({ people, events }: { people: Prospect[]; events: StaffEvent[] }) {
  const eventById = new Map(events.map((e) => [e.id, e]));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">People</h1>
          <p className="mt-2 text-muted">
            Everyone you&apos;ve found for upcoming events, and what to do next.
          </p>
        </div>
        <Link
          href="/admin/new"
          className="bg-copper px-5 py-3 text-sm font-medium text-mist transition hover:bg-copper-bright"
        >
          + Add someone from JobGet
        </Link>
      </div>

      <ul className="mt-8 flex flex-wrap gap-2">
        {stages.map((stage) => {
          const count = people.filter((p) => p.stage === stage.key).length;
          return (
            <li
              key={stage.key}
              className={`px-3 py-1.5 text-sm ${count ? "bg-ink text-mist" : "bg-ink/5 text-muted"}`}
            >
              {stage.label} · {count}
            </li>
          );
        })}
      </ul>

      {people.length === 0 && (
        <p className="mt-10 text-muted">
          Nobody yet. <Link href="/admin/new" className="text-copper">Add your first person →</Link>
        </p>
      )}

      {stages.map((stage) => {
        const group = people.filter((p) => p.stage === stage.key);
        if (group.length === 0) return null;
        return (
          <section key={stage.key} className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-xl text-ink">{stage.label}</h2>
              <p className="text-sm text-muted">{stage.next}</p>
            </div>
            <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {group.map((person) => {
                const event = eventById.get(person.eventId);
                const role = getRole(event, person.roleId);
                return (
                  <li key={person.id}>
                    <Link
                      href={`/admin/people/${person.id}`}
                      className="flex items-center justify-between gap-4 py-4 transition hover:bg-stone/40 sm:px-2"
                    >
                      <div>
                        <p className="font-medium text-ink">{person.name}</p>
                        <p className="mt-0.5 text-sm text-muted">
                          {person.headline} · {person.city}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-ink">{role?.title ?? "No role"}</p>
                        <p className="mt-0.5 text-muted">
                          {event ? `${event.client} · ${event.city}` : "No event"}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <TeamSection people={people} />
    </div>
  );
}
