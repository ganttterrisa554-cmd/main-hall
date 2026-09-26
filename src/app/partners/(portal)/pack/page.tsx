import Link from "next/link";
import {
  allDocs,
  invitation,
  laterDocs,
  sendBack,
  welcomePack,
  type PackDoc,
} from "@/data/partnerPack";

export const metadata = { title: "Partner documents" };

const steps = [
  { n: "1", title: "Find them", body: "You spot their profile on JobGet." },
  {
    n: "2",
    title: "Invite them",
    body: "Send the job invitation: the event, the work, and why them.",
  },
  {
    n: "3",
    title: "They say yes",
    body: "They get their partner login, with 5 documents already waiting.",
  },
  {
    n: "4",
    title: "They send back",
    body: "Their quote, signed agreement, W-9, and payment details. Then you confirm the booking.",
  },
];

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

export default function PackIndexPage() {
  const required = sendBack.filter((s) => s.required);
  const optional = sendBack.filter((s) => !s.required);

  return (
    <div>
      <Link href="/partners" className="text-sm text-muted transition hover:text-copper">
        ← Back
      </Link>
      <h1 className="font-display mt-6 text-3xl text-ink sm:text-4xl">Partner documents</h1>
      <p className="mt-3 text-base text-muted">
        All {allDocs.length} documents Main Hall sends a partner, from the first invitation to
        the year-end tax letter. Click any document to read it.
      </p>

      <ol className="mt-10 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.n} className="bg-mist p-5">
            <p className="font-display text-sm text-copper">{step.n}</p>
            <p className="font-display mt-2 text-lg text-ink">{step.title}</p>
            <p className="mt-1 text-sm text-muted">{step.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">Before they agree: 1 document</h2>
        <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          <DocRow doc={invitation} />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">
          The moment they agree: {welcomePack.length} documents in their login
        </h2>
        <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {welcomePack.map((doc) => (
            <DocRow key={doc.slug} doc={doc} />
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">
          After that: {laterDocs.length} more documents
        </h2>
        <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {laterDocs.map((doc) => (
            <DocRow key={doc.slug} doc={doc} />
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">
          What they send back: {required.length} items, plus {optional.length} only if needed
        </h2>
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
    </div>
  );
}
