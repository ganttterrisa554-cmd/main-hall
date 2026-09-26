import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { requireTeam } from "@/lib/auth";
import { unreadCount } from "@/lib/mail";

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  await requireTeam();
  const unread = await unreadCount();

  const links = [
    { href: "/admin", label: "People" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/inbox", label: "Inbox", badge: unread },
    { href: "/admin/team", label: "Team" },
  ];

  return (
    <>
      <header className="bg-ink text-stone">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/admin" className="flex items-baseline gap-3">
            <span className="font-display text-lg tracking-[0.18em] uppercase">Main Hall</span>
            <span className="text-xs tracking-[0.14em] text-copper uppercase">Team</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone/75">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-1.5 transition hover:text-stone">
                {link.label}
                {link.badge ? (
                  <span className="bg-copper px-1.5 py-0.5 text-[10px] leading-none font-medium text-mist">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
            <Link href="/admin/account" className="transition hover:text-stone">
              Account
            </Link>
            <form action={logout}>
              <button type="submit" className="transition hover:text-stone">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">{children}</main>
    </>
  );
}
