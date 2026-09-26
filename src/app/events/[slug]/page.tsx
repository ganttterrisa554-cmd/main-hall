import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { company } from "@/data/company";
import { events, getEventBySlug, type Event } from "@/data/events";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Event" };
  const description = describeEvent(event);
  return {
    title: `${event.title} · ${event.city}, ${event.state}`,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      type: "article",
      url: `/events/${event.slug}`,
      title: `${event.title} — ${event.client}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} — ${event.client}`,
      description,
    },
  };
}

function describeEvent(event: Event) {
  const guests = event.attendees.toLocaleString("en-US");
  const days = event.days === 1 ? "one day" : `${event.days} days`;
  return `${event.type} for ${event.client} at ${event.venue}, ${event.city}, ${event.state}: ${guests} guests over ${days}, planned and run by Main Hall.`;
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const related = events
    .filter(
      (e) =>
        e.id !== event.id &&
        (e.state === event.state || e.type === event.type),
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${company.url}/` },
            { "@type": "ListItem", position: 2, name: "Events", item: `${company.url}/events` },
            {
              "@type": "ListItem",
              position: 3,
              name: event.title,
              item: `${company.url}/events/${event.slug}`,
            },
          ],
        }}
      />
      <SiteHeader />

      <main className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/events"
            className="text-sm text-muted transition hover:text-copper"
          >
            ← All events
          </Link>

          <p className="mt-10 text-xs tracking-[0.22em] text-copper uppercase">
            {event.type} · {event.year}
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-3xl leading-tight text-ink sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-4 text-lg text-muted">{event.client}</p>

          <dl className="mt-12 grid gap-6 border-y border-[var(--line)] py-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs tracking-[0.14em] text-muted uppercase">
                Date
              </dt>
              <dd className="mt-2 font-display text-lg text-ink">
                {formatDate(event.date)}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.14em] text-muted uppercase">
                Location
              </dt>
              <dd className="mt-2 font-display text-lg text-ink">
                {event.city}, {event.state}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.14em] text-muted uppercase">
                Venue
              </dt>
              <dd className="mt-2 font-display text-lg text-ink">
                {event.venue}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.14em] text-muted uppercase">
                Scale
              </dt>
              <dd className="mt-2 font-display text-lg text-ink">
                {event.attendees.toLocaleString()} guests · {event.days} day
                {event.days > 1 ? "s" : ""}
              </dd>
            </div>
          </dl>

          <div className="mt-12 max-w-2xl">
            <h2 className="font-display text-2xl text-ink">How it ran</h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              {event.body}
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link
              href="/#contact"
              className="bg-copper px-6 py-3.5 text-sm font-medium tracking-wide text-mist transition hover:bg-copper-bright"
            >
              Plan something like this
            </Link>
            <Link
              href="/events"
              className="border border-ink/20 px-6 py-3.5 text-sm tracking-wide text-ink transition hover:border-ink hover:bg-ink/5"
            >
              Browse more events
            </Link>
          </div>

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl text-ink">Related events</h2>
              <ul className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/events/${item.slug}`}
                      className="grid gap-1 py-5 transition hover:bg-stone/40 sm:grid-cols-[5rem_1fr] sm:gap-8 sm:px-2"
                    >
                      <span className="font-display text-sm tracking-[0.14em] text-copper">
                        {item.year}
                      </span>
                      <div>
                        <p className="font-display text-lg text-ink">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {item.client} · {item.city}, {item.state}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
