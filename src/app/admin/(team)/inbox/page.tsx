import Link from "next/link";
import { CheckMailButton } from "@/components/admin/inbox/CheckMailButton";
import { formatDateTime } from "@/data/admin";
import { listThreads, mailSettings } from "@/lib/mail";

export const metadata = { title: "Inbox" };

const filters = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "sent", label: "Sent" },
] as const;

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const filter = filters.find((f) => f.key === show)?.key ?? "all";
  const threads = await listThreads(filter);
  const mail = mailSettings();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Inbox</h1>
          <p className="mt-2 text-muted">Every email to and from partners, in one place.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <CheckMailButton />
          <Link
            href="/admin/inbox/new"
            className="bg-copper px-5 py-3 text-sm font-medium text-mist transition hover:bg-copper-bright"
          >
            New email
          </Link>
        </div>
      </div>

      {!mail.configured && (
        <p className="mt-6 bg-amber-500/15 px-4 py-3 text-sm text-ink">
          Email isn&apos;t connected yet. Messages are saved here but not delivered until you add your Resend API
          key. <Link href="/admin/account" className="text-copper">Details →</Link>
        </p>
      )}

      <nav className="mt-8 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/inbox" : `/admin/inbox?show=${f.key}`}
            className={`px-3 py-1.5 text-sm ${filter === f.key ? "bg-ink text-mist" : "bg-ink/5 text-muted hover:text-ink"}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {threads.length === 0 ? (
        <p className="mt-10 text-muted">No emails here yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {threads.map((t) => (
            <li key={t.threadId}>
              <Link
                href={`/admin/inbox/${t.threadId}`}
                className={`grid gap-1 py-4 transition hover:bg-stone/40 sm:grid-cols-[12rem_1fr_auto] sm:gap-6 sm:px-2 ${
                  t.unread ? "bg-white" : ""
                }`}
              >
                <span className={`truncate text-sm ${t.unread ? "font-semibold text-ink" : "text-ink"}`}>
                  {t.personName ?? t.counterpart}
                  {t.count > 1 && <span className="ml-1.5 text-xs font-normal text-muted">{t.count}</span>}
                </span>
                <span className="min-w-0 text-sm">
                  <span className={t.unread ? "font-semibold text-ink" : "text-ink"}>{t.subject}</span>
                  <span className="text-muted"> · {t.preview}</span>
                </span>
                <span className="flex items-center gap-2 text-xs text-muted sm:justify-end">
                  {t.unread > 0 && <span className="h-2 w-2 rounded-full bg-copper" aria-label="Unread" />}
                  {formatDateTime(t.lastAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
