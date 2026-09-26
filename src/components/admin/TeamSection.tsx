import Image from "next/image";
import Link from "next/link";
import type { Prospect } from "@/data/admin";
import { looksAfterLabel, team } from "@/data/team";

export function TeamSection({ people }: { people: Prospect[] }) {

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl text-ink">Your team</h2>
        <Link href="/admin/team" className="text-sm text-muted transition hover:text-copper">
          Full profiles →
        </Link>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {team.map((member) => {
          const count = people.filter(member.looksAfter.owns).length;
          return (
            <li key={member.id}>
              <Link
                href={`/admin/team#${member.id}`}
                className="block border border-[var(--line)] bg-white p-4 transition hover:border-ink/30"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-stone">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 180px, 45vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 font-medium text-ink">{member.name}</p>
                <p className="text-sm text-muted">{member.role}</p>
                <p className="mt-2 text-xs text-muted">
                  <span className="font-medium text-copper">{count}</span> {looksAfterLabel(member, count)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
