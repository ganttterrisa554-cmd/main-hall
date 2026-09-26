import Image from "next/image";
import Link from "next/link";
import type { Prospect, StaffEvent } from "@/data/admin";
import { looksAfterLabel, team } from "@/data/team";

export function TeamProfiles({ people, events }: { people: Prospect[]; events: StaffEvent[] }) {
  const eventById = new Map(events.map((e) => [e.id, e]));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Team</h1>
      <p className="mt-2 text-muted">
        Who does what at Main Hall, and who partners should call.
      </p>

      <ul className="mt-10 space-y-6">
        {team.map((member) => {
          const theirPeople = people.filter(member.looksAfter.owns);
          const theirEvents = events.filter((e) => e.producerId === member.id);
          return (
            <li
              key={member.id}
              id={member.id}
              className="grid scroll-mt-8 gap-6 border border-[var(--line)] bg-white p-5 sm:grid-cols-[11rem_1fr] sm:p-6"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-stone sm:w-44">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="(min-width: 640px) 176px, 90vw"
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="font-display text-2xl text-ink">{member.name}</h2>
                    <p className="text-copper">{member.role}</p>
                  </div>
                  <p className="text-sm text-muted">
                    {member.city} · at Main Hall since {member.since}
                  </p>
                </div>

                <p className="mt-4 leading-relaxed text-ink">{member.bio}</p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {member.handles.map((h) => (
                    <li key={h} className="bg-stone/70 px-2.5 py-1 text-xs text-ink">
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid gap-4 border-t border-[var(--line)] pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted">Contact</p>
                    <a href={`mailto:${member.email}`} className="mt-1 block text-copper">
                      {member.email}
                    </a>
                    <p className="text-ink">{member.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">
                      Looking after now: {theirPeople.length} {looksAfterLabel(member, theirPeople.length)}
                    </p>
                    {theirPeople.length > 0 ? (
                      <ul className="mt-1 space-y-0.5">
                        {theirPeople.map((p) => (
                          <li key={p.id}>
                            <Link href={`/admin/people/${p.id}`} className="text-ink hover:text-copper">
                              {p.name}
                            </Link>
                            <span className="text-muted"> · {eventById.get(p.eventId)?.city}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-muted">Nobody right now</p>
                    )}
                    {theirEvents.length > 0 && (
                      <p className="mt-2 text-xs text-muted">
                        Producing:{" "}
                        {theirEvents.map((e, i) => (
                          <span key={e.id}>
                            {i > 0 && ", "}
                            <Link href={`/admin/events/${e.id}`} className="hover:text-copper">
                              {e.client} ({e.city})
                            </Link>
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
