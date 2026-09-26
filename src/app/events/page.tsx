import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  events,
  eventStates,
  eventTypes,
  type Event,
  type EventType,
} from "@/data/events";

export const metadata = {
  title: "Corporate Events We've Planned Across the USA",
  description:
    "Browse 300 company events Main Hall has planned and delivered across the United States: conferences, product launches, offsites, galas, and awards nights.",
  alternates: { canonical: "/events" },
  openGraph: {
    url: "/events",
    title: "Corporate events planned by Main Hall",
    description:
      "300 conferences, launches, offsites, and galas planned and delivered across the United States.",
  },
};

const PAGE_SIZE = 24;

type SearchParams = Promise<{
  type?: string;
  state?: string;
  q?: string;
  page?: string;
}>;

function filterEvents(
  all: Event[],
  type?: string,
  state?: string,
  q?: string,
): Event[] {
  const query = q?.trim().toLowerCase() ?? "";
  return all.filter((event) => {
    if (type && event.type !== type) return false;
    if (state && event.state !== state) return false;
    if (!query) return true;
    const hay = [
      event.title,
      event.client,
      event.city,
      event.state,
      event.venue,
      event.type,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(query);
  });
}

function buildHref(params: {
  type?: string;
  state?: string;
  q?: string;
  page?: number;
}) {
  const sp = new URLSearchParams();
  if (params.type) sp.set("type", params.type);
  if (params.state) sp.set("state", params.state);
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/events?${qs}` : "/events";
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const type =
    sp.type && eventTypes.includes(sp.type as EventType)
      ? (sp.type as EventType)
      : undefined;
  const state =
    sp.state && eventStates.includes(sp.state) ? sp.state : undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const filtered = filterEvents(events, type, state, q);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.22em] text-copper uppercase">
            Archive
          </p>
          <h1 className="font-display mt-4 max-w-2xl text-3xl leading-tight text-ink sm:text-5xl">
            Events across the United States.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            {events.length} programmes planned and delivered — conferences,
            launches, offsites, galas, and more in cities from coast to coast.
          </p>

          <form
            method="get"
            className="mt-10 grid gap-3 border-y border-[var(--line)] py-6 sm:grid-cols-[1fr_auto_auto_auto]"
          >
            <label className="block">
              <span className="sr-only">Search</span>
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search city, venue, client…"
                className="w-full border border-[var(--line)] bg-transparent px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/50 focus:border-copper"
              />
            </label>
            <label className="block">
              <span className="sr-only">Type</span>
              <select
                name="type"
                defaultValue={type ?? ""}
                className="h-full w-full border border-[var(--line)] bg-transparent px-3 py-3 text-sm text-ink outline-none focus:border-copper"
              >
                <option value="">All types</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">State</span>
              <select
                name="state"
                defaultValue={state ?? ""}
                className="h-full w-full border border-[var(--line)] bg-transparent px-3 py-3 text-sm text-ink outline-none focus:border-copper"
              >
                <option value="">All states</option>
                {eventStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="bg-ink px-5 py-3 text-sm font-medium tracking-wide text-mist transition hover:bg-ink-soft"
            >
              Filter
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Showing {slice.length} of {filtered.length} events
            {type || state || q ? " (filtered)" : ""}
          </p>

          <ul className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {slice.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.slug}`}
                  className="grid gap-2 py-6 transition hover:bg-stone/40 sm:grid-cols-[5rem_1fr_auto] sm:items-baseline sm:gap-8 sm:px-2"
                >
                  <span className="font-display text-sm tracking-[0.14em] text-copper">
                    {event.year}
                  </span>
                  <div>
                    <p className="font-display text-lg text-ink sm:text-xl">
                      {event.title}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {event.client} · {event.type}
                    </p>
                  </div>
                  <p className="text-sm text-muted sm:max-w-xs sm:text-right">
                    {event.city}, {event.state}
                    <br />
                    <span className="text-muted/80">{event.venue}</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p className="py-16 text-center text-muted">
              No events match those filters.{" "}
              <Link href="/events" className="text-copper underline">
                Clear filters
              </Link>
            </p>
          )}

          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-between gap-4"
              aria-label="Pagination"
            >
              <Link
                href={buildHref({
                  type,
                  state,
                  q,
                  page: Math.max(1, safePage - 1),
                })}
                aria-disabled={safePage <= 1}
                className={`text-sm ${
                  safePage <= 1
                    ? "pointer-events-none text-muted/40"
                    : "text-ink transition hover:text-copper"
                }`}
              >
                ← Previous
              </Link>
              <p className="text-sm text-muted">
                Page {safePage} of {totalPages}
              </p>
              <Link
                href={buildHref({
                  type,
                  state,
                  q,
                  page: Math.min(totalPages, safePage + 1),
                })}
                aria-disabled={safePage >= totalPages}
                className={`text-sm ${
                  safePage >= totalPages
                    ? "pointer-events-none text-muted/40"
                    : "text-ink transition hover:text-copper"
                }`}
              >
                Next →
              </Link>
            </nav>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
