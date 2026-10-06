import Link from "next/link";
import { formatLong } from "@/data/admin";
import { bookingConfirmation, sendBack, welcomePack, type PackDoc } from "@/data/partnerPack";
import { loadPartnerPack } from "@/lib/partnerPack";

export const metadata = { title: "Your documents" };

function DocRow({ doc }: { doc: PackDoc }) {
  return (
    <li>
      <Link
        href={`/partners/pack/${doc.slug}`}
        className="flex items-start justify-between gap-4 py-5 transition hover:bg-stone/40 sm:px-2"
      >
        <div>
          <p className="font-display text-lg text-ink">{doc.title}</p>
          <p className="mt-1 text-sm text-muted">{doc.summary}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm text-copper">{doc.action}</p>
          <p className="mt-1 text-xs text-muted">
            {doc.pages} page{doc.pages > 1 ? "s" : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}

export default async function PackIndexPage() {
  const { job, event, producer } = await loadPartnerPack();

  return (
    <div>
      <Link href="/partners" className="text-sm text-muted transition hover:text-copper">
        ← Back
      </Link>
      <h1 className="font-display mt-6 text-3xl text-ink sm:text-4xl">Your documents</h1>
      <p className="mt-3 text-base text-muted">
        {event
          ? `Everything for ${event.client} · ${event.name} on ${formatLong(event.date)}.`
          : "No job assigned yet — your producer will be in touch."}
      </p>

      {job && event && (
        <>
          <section className="mt-12">
            <h2 className="font-display text-xl text-ink">Read and sign</h2>
            <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {welcomePack.map((doc) => (
                <DocRow key={doc.slug} doc={doc} />
              ))}
            </ul>
          </section>

          {job.quoteStatus === "accepted" && (
            <section className="mt-12">
              <h2 className="font-display text-xl text-ink">Your booking</h2>
              <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                <DocRow doc={bookingConfirmation} />
              </ul>
            </section>
          )}
        </>
      )}

      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">What we need back from you</h2>
        <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {sendBack.map((item) => (
            <li key={item.name} className="flex items-start justify-between gap-4 py-4 sm:px-2">
              <div>
                <p className="text-sm font-medium text-ink">
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="hover:text-copper">
                      {item.name} ↗
                    </a>
                  ) : (
                    item.name
                  )}
                </p>
                <p className="mt-1 text-sm text-muted">{item.how}</p>
              </div>
              <span
                className={`shrink-0 text-right text-xs ${item.required ? "text-copper" : "text-muted"}`}
              >
                {item.when}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-12 text-sm text-muted">
        Questions? Call {producer.name} at {producer.phone} or reply to any of our emails.
      </p>
    </div>
  );
}
