import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { company } from "@/data/company";
import { getFeaturedEvents } from "@/data/events";
import { team } from "@/data/team";

const services = [
  {
    title: "Conferences & summits",
    body: "Stage, flow, registration, and hospitality — built for clarity from keynote to close.",
  },
  {
    title: "Product launches",
    body: "Reveal moments that land with press, partners, and the people who ship the product.",
  },
  {
    title: "Offsites & retreats",
    body: "Agendas that protect thinking time, with logistics that stay invisible to your team.",
  },
  {
    title: "Galas & celebrations",
    body: "Milestones staged with the same precision you bring to the business itself.",
  },
];

const steps = [
  {
    n: "01",
    title: "Brief",
    body: "We learn the company, the room, and what success must feel like on the night.",
  },
  {
    n: "02",
    title: "Design",
    body: "Venue, run-of-show, vendors, and guest journey — one plan, no loose ends.",
  },
  {
    n: "03",
    title: "Deliver",
    body: "On-site leadership from load-in to last guest out, so your team can host.",
  },
];

const awards = [
  {
    year: "2025",
    title: "Best Corporate Conference",
    org: "Eventex Awards",
    detail: "Meridian Cloud Customer Connect Summit · San Francisco",
  },
  {
    year: "2025",
    title: "Gold — Live Experience Design",
    org: "Hermes Creative Awards",
    detail: "Forge Robotics Series C Product Launch · Pier 27",
  },
  {
    year: "2024",
    title: "Agency of the Year — Events",
    org: "BizBash",
    detail: "National recognition for end-to-end corporate programmes",
  },
  {
    year: "2024",
    title: "Best Gala / Awards Night",
    org: "Special Events Magazine",
    detail: "Brightline Commerce Holiday Gala · Cipriani Wall Street",
  },
  {
    year: "2024",
    title: "Outstanding Hybrid Production",
    org: "Event Technology Awards",
    detail: "Cascade Bank Centennial Town Hall · Seattle + broadcast",
  },
  {
    year: "2023",
    title: "Best Experiential Activation",
    org: "Exhibitor Magazine",
    detail: "Northwind Mutual National Agents Conference · Chicago",
  },
  {
    year: "2023",
    title: "Silver — Meetings & Events",
    org: "Clio Awards",
    detail: "Halcyon Health Leadership Offsite · Canyon Point, UT",
  },
  {
    year: "2022",
    title: "Planner of the Year — Corporate",
    org: "Meeting Professionals International",
    detail: "MPI Greater New York Chapter",
  },
];

const testimonials = [
  {
    quote:
      "Main Hall ran our San Francisco summit like a product release — every cue hit, and our team actually got to host instead of firefight.",
    name: "Rachel Nguyen",
    role: "VP Marketing, Meridian Cloud",
  },
  {
    quote:
      "The offsite brief was a mess. They turned it into a clear agenda, invisible logistics, and three days our leadership still references.",
    name: "Marcus Ellison",
    role: "Chief of Staff, Halcyon Health",
  },
  {
    quote:
      "From load-in on Wall Street to the last toast, nothing drifted. Guests felt the brand; we felt in control.",
    name: "Sophia Rivera",
    role: "Head of People, Brightline Commerce",
  },
];

export default function HomePage() {
  const events = getFeaturedEvents(6);

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${company.url}/#organization`,
              name: company.name,
              alternateName: "Main Hall",
              url: `${company.url}/`,
              logo: `${company.url}/icon-512.png`,
              image: `${company.url}/hero.jpg`,
              description: company.description,
              email: company.email,
              telephone: company.phoneE164,
              areaServed: { "@type": "Country", name: "United States" },
              knowsAbout: services.map((s) => s.title),
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                telephone: company.phoneE164,
                email: company.email,
                areaServed: "US",
                availableLanguage: "English",
              },
              employee: team.map((m) => ({
                "@type": "Person",
                name: m.name,
                jobTitle: m.role,
                image: `${company.url}${m.photo}`,
                workLocation: { "@type": "Place", address: m.city },
              })),
            },
            {
              "@type": "WebSite",
              "@id": `${company.url}/#website`,
              url: `${company.url}/`,
              name: "Main Hall",
              publisher: { "@id": `${company.url}/#organization` },
              inLanguage: "en-US",
            },
          ],
        }}
      />
      <SiteHeader tone="overlay" />

      <main id="top">
        <section className="relative min-h-[100svh] overflow-hidden bg-ink">
          <div className="absolute inset-0">
            <Image
              src="/hero.jpg"
              alt="Corporate banquet tables set in a lit atrium venue"
              fill
              priority
              className="hero-media object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/88 via-ink/55 to-ink/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/35" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20">
            <p className="animate-rise font-display text-4xl tracking-[0.2em] whitespace-nowrap text-stone uppercase sm:text-6xl md:text-7xl">
              Main Hall
            </p>
            <div className="accent-line mt-5 h-px w-24 bg-copper" />
            <h1 className="animate-rise-delay-1 font-display mt-7 max-w-xl text-3xl leading-tight text-stone sm:text-4xl md:text-[2.75rem]">
              Company events, planned end to end.
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-md text-base leading-relaxed text-stone/80 sm:text-lg">
              We design and run conferences, launches, offsites, and celebrations
              for teams that need the night to feel intentional.
            </p>
            <div className="animate-rise-delay-3 mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="bg-copper px-6 py-3.5 text-sm font-medium tracking-wide text-mist transition hover:bg-copper-bright"
              >
                Plan your next event
              </a>
              <a
                href="#work"
                className="border border-stone/40 px-6 py-3.5 text-sm tracking-wide text-stone transition hover:border-stone hover:bg-stone/10"
              >
                See what we plan
              </a>
            </div>
          </div>
        </section>

        <section
          id="work"
          className="border-b border-[var(--line)] bg-mist px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs tracking-[0.22em] text-copper uppercase">
              What we plan
            </p>
            <h2 className="font-display mt-4 max-w-2xl text-3xl leading-tight text-ink sm:text-4xl">
              Corporate gatherings with the polish of a product launch.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              One brief. One production team. From the first venue shortlist to
              the last thank-you note.
            </p>

            <ul className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
              {services.map((item) => (
                <li key={item.title} className="border-t border-[var(--line)] pt-6">
                  <h3 className="font-display text-xl text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="process"
          className="bg-ink px-5 py-20 text-stone sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs tracking-[0.22em] text-copper uppercase">
              Process
            </p>
            <h2 className="font-display mt-4 max-w-xl text-3xl leading-tight sm:text-4xl">
              Three moves from brief to standing ovation.
            </h2>

            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((step) => (
                <li key={step.n}>
                  <p className="font-display text-sm tracking-[0.2em] text-copper">
                    {step.n}
                  </p>
                  <h3 className="font-display mt-4 text-2xl">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone/70 sm:text-base">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="events"
          className="border-b border-[var(--line)] bg-mist px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs tracking-[0.22em] text-copper uppercase">
              Selected events
            </p>
            <h2 className="font-display mt-4 max-w-2xl text-3xl leading-tight text-ink sm:text-4xl">
              Work we have put on the floor.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              A sample of company programmes we have planned and delivered
              across the United States — conferences, launches, retreats, and
              galas.
            </p>

            <ul className="mt-14 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {events.map((event) => (
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
                        {event.client} · {event.city}, {event.state}
                      </p>
                    </div>
                    <p className="text-sm text-muted sm:max-w-xs sm:text-right">
                      {event.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 border border-ink/20 px-6 py-3.5 text-sm tracking-wide text-ink transition hover:border-ink hover:bg-ink/5"
              >
                View all 300 events
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section
          id="awards"
          className="bg-ink px-5 py-20 text-stone sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs tracking-[0.22em] text-copper uppercase">
              Recognition
            </p>
            <h2 className="font-display mt-4 max-w-2xl text-3xl leading-tight sm:text-4xl">
              Awards for work that held under pressure.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone/70">
              Industry recognition for programmes we planned and delivered —
              judged on craft, guest experience, and operational precision.
            </p>

            <ul className="mt-14 divide-y divide-stone/15 border-y border-stone/15">
              {awards.map((award) => (
                <li
                  key={`${award.year}-${award.title}`}
                  className="grid gap-2 py-6 sm:grid-cols-[5rem_1fr_auto] sm:items-baseline sm:gap-8"
                >
                  <span className="font-display text-sm tracking-[0.14em] text-copper">
                    {award.year}
                  </span>
                  <div>
                    <p className="font-display text-lg sm:text-xl">
                      {award.title}
                    </p>
                    <p className="mt-1 text-sm text-stone/65">{award.org}</p>
                  </div>
                  <p className="text-sm text-stone/55 sm:max-w-xs sm:text-right">
                    {award.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="team"
          className="border-b border-[var(--line)] bg-mist px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs tracking-[0.22em] text-copper uppercase">
              Our team
            </p>
            <h2 className="font-display mt-4 max-w-2xl text-3xl leading-tight text-ink sm:text-4xl">
              The people running your event.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              A small senior team based across the country. The producer you
              meet at the brief is the one on the floor on the night.
            </p>

            <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-5">
              {team.map((member) => (
                <li key={member.id}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone">
                    <Image
                      src={member.photo}
                      alt={`${member.name}, ${member.role}`}
                      fill
                      sizes="(min-width: 1024px) 220px, 50vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <h3 className="font-display mt-5 text-lg text-ink">{member.name}</h3>
                  <p className="mt-1 text-sm text-copper">{member.role}</p>
                  <p className="mt-1 text-xs tracking-wide text-muted">{member.city}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{member.intro}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="voices"
          className="bg-stone px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs tracking-[0.22em] text-copper uppercase">
              Testimonials
            </p>
            <h2 className="font-display mt-4 max-w-2xl text-3xl leading-tight text-ink sm:text-4xl">
              What clients say after the lights come up.
            </h2>

            <ul className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
              {testimonials.map((item) => (
                <li key={item.name} className="border-t border-[var(--line)] pt-6">
                  <blockquote className="text-base leading-relaxed text-ink">
                    “{item.quote}”
                  </blockquote>
                  <p className="mt-6 font-display text-sm tracking-wide text-ink">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">{item.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="contact"
          className="border-t border-[var(--line)] bg-mist px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs tracking-[0.22em] text-copper uppercase">
              Book a brief
            </p>
            <h2 className="font-display mt-4 max-w-lg text-3xl leading-tight text-ink sm:text-4xl">
              Tell us the date. We&apos;ll bring the room to life.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Share your company, event type, and timing — we reply with a
              clear next step within one business day.
            </p>
            <p className="mt-3 text-base text-muted">
              Prefer to talk? Call{" "}
              <a href={company.phoneHref} className="text-copper transition hover:text-ink">
                {company.phone}
              </a>
              .
            </p>

            <form
              className="mt-12 grid max-w-xl gap-5"
              action="mailto:hello@mainhallevents.com"
              method="get"
              encType="text/plain"
            >
              <label className="block">
                <span className="text-xs tracking-[0.14em] text-muted uppercase">
                  Company
                </span>
                <input
                  name="company"
                  required
                  className="mt-2 w-full border border-[var(--line)] bg-transparent px-4 py-3 text-ink outline-none transition focus:border-copper"
                />
              </label>
              <label className="block">
                <span className="text-xs tracking-[0.14em] text-muted uppercase">
                  Event type
                </span>
                <input
                  name="event"
                  required
                  placeholder="Conference, launch, offsite…"
                  className="mt-2 w-full border border-[var(--line)] bg-transparent px-4 py-3 text-ink outline-none transition placeholder:text-muted/50 focus:border-copper"
                />
              </label>
              <label className="block">
                <span className="text-xs tracking-[0.14em] text-muted uppercase">
                  Work email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-2 w-full border border-[var(--line)] bg-transparent px-4 py-3 text-ink outline-none transition focus:border-copper"
                />
              </label>
              <button
                type="submit"
                className="mt-2 w-fit bg-ink px-7 py-3.5 text-sm font-medium tracking-wide text-mist transition hover:bg-ink-soft"
              >
                Send the brief
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
