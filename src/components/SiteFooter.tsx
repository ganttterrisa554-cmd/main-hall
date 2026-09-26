import { company } from "@/data/company";

export function SiteFooter() {
  return (
    <footer className="bg-ink px-5 py-8 text-stone/60 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-sm tracking-[0.18em] text-stone uppercase">
          Main Hall
        </p>
        <p className="text-sm">
          Corporate event planning ·{" "}
          <a href={`mailto:${company.email}`} className="transition hover:text-stone">
            {company.email}
          </a>{" "}
          ·{" "}
          <a href={company.phoneHref} className="transition hover:text-stone">
            {company.phone}
          </a>
        </p>
      </div>
    </footer>
  );
}
