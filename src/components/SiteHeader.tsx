import Link from "next/link";

type Props = {
  tone?: "overlay" | "solid";
};

export function SiteHeader({ tone = "solid" }: Props) {
  const overlay = tone === "overlay";

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-20"
          : "border-b border-[var(--line)] bg-mist"
      }
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link
          href="/"
          className={`font-display text-xl tracking-[0.18em] uppercase ${
            overlay ? "text-stone" : "text-ink"
          }`}
        >
          Main Hall
        </Link>
        <nav
          className={`hidden items-center gap-8 text-sm sm:flex ${
            overlay ? "text-stone/85" : "text-muted"
          }`}
        >
          <Link
            href="/#work"
            className={overlay ? "transition hover:text-stone" : "transition hover:text-ink"}
          >
            What we plan
          </Link>
          <Link
            href="/events"
            className={overlay ? "transition hover:text-stone" : "transition hover:text-ink"}
          >
            Events
          </Link>
          <Link
            href="/#awards"
            className={overlay ? "transition hover:text-stone" : "transition hover:text-ink"}
          >
            Awards
          </Link>
          <Link
            href="/#team"
            className={overlay ? "transition hover:text-stone" : "transition hover:text-ink"}
          >
            Team
          </Link>
          <Link
            href="/#voices"
            className={overlay ? "transition hover:text-stone" : "transition hover:text-ink"}
          >
            Voices
          </Link>
          <Link
            href="/partners"
            className={overlay ? "transition hover:text-stone" : "transition hover:text-ink"}
          >
            Partner login
          </Link>
          <Link
            href="/#contact"
            className={
              overlay
                ? "border border-stone/35 px-4 py-2 text-stone transition hover:border-stone hover:bg-stone/10"
                : "border border-ink/20 px-4 py-2 text-ink transition hover:border-ink hover:bg-ink/5"
            }
          >
            Book a brief
          </Link>
        </nav>
      </div>
    </header>
  );
}
