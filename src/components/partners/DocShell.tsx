import Link from "next/link";
import { PrintButton } from "@/components/partners/PrintButton";
import { company } from "@/data/company";
import { allDocs, findDoc, pack, welcomePack, type PackDoc } from "@/data/partnerPack";

export type DocFact = { label: string; value: string };

function positionLabel(doc: PackDoc) {
  switch (doc.stage) {
    case "before":
      return "Sent before they join";
    case "welcome":
      return `Welcome pack · ${welcomePack.findIndex((d) => d.slug === doc.slug) + 1} of ${welcomePack.length}`;
    case "booking":
      return "Sent for every confirmed job";
    case "yearly":
      return "Sent in January, if needed";
  }
}

export function DocShell({
  slug,
  facts,
  children,
}: {
  slug: string;
  facts: [DocFact, DocFact, DocFact, DocFact];
  children: React.ReactNode;
}) {
  const doc = findDoc(slug);
  if (!doc) return null;

  const index = allDocs.findIndex((d) => d.slug === slug);
  const prev = allDocs[index - 1];
  const next = allDocs[index + 1];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link href="/partners/pack" className="text-sm text-muted transition hover:text-copper">
          ← All documents
        </Link>
        <PrintButton />
      </div>

      <article className="doc-sheet mt-6 overflow-hidden border border-[var(--line)] bg-white shadow-[0_18px_40px_-24px_rgba(18,20,26,0.35)] print:mt-0 print:border-0 print:shadow-none">
        <div className="h-1.5 bg-copper" />

        <div className="px-6 py-10 sm:px-12 sm:py-12 print:px-0 print:py-6">
          <header className="flex items-start justify-between gap-6">
            <div>
              <p className="font-display text-xl tracking-[0.22em] text-ink uppercase">Main Hall</p>
              <p className="mt-1 text-[11px] tracking-[0.16em] text-muted uppercase">
                Corporate event planning
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-ink px-2.5 py-1 text-[10px] tracking-[0.16em] text-mist uppercase">
                {doc.action}
              </span>
              <p className="mt-2 text-xs text-muted">Ref {doc.ref}</p>
              <p className="text-xs text-muted">{doc.date}</p>
            </div>
          </header>

          <div className="mt-12">
            <p className="text-[11px] tracking-[0.22em] text-copper uppercase">
              {positionLabel(doc)}
            </p>
            <h1 className="font-display mt-2 text-3xl leading-tight text-ink sm:text-[2.5rem]">
              {doc.title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Prepared for {pack.preparedFor} · {pack.business}
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="bg-mist px-4 py-3.5">
                <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="doc-body mt-4">{children}</div>

          <footer className="mt-14 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-5 text-[11px] text-muted">
            <span>
              {company.name} · {company.email} · {company.phone} · {company.site}
            </span>
            <span>
              {doc.title} · {doc.ref}
            </span>
          </footer>
        </div>
      </article>

      <nav className="mt-8 flex justify-between gap-4 text-sm print:hidden">
        {prev ? (
          <Link href={`/partners/pack/${prev.slug}`} className="text-muted transition hover:text-copper">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/partners/pack/${next.slug}`} className="text-muted transition hover:text-copper">
            {next.title} →
          </Link>
        )}
      </nav>
    </div>
  );
}
