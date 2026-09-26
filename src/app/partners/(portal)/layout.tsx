import Link from "next/link";
import { company } from "@/data/company";
import { requirePartner } from "@/lib/auth";
import { logoutPartner } from "@/app/partners/actions";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePartner();

  return (
    <>
      <header className="bg-ink text-stone print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/partners" className="font-display text-lg tracking-[0.18em] uppercase">
            Main Hall
          </Link>
          <div className="flex items-center gap-4 text-sm text-stone/70">
            <span className="hidden sm:inline">{user.name}</span>
            <form action={logoutPartner}>
              <button type="submit" className="transition hover:text-stone">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14 print:max-w-none print:p-0">
        {children}
      </main>

      <footer className="border-t border-[var(--line)] px-5 py-8 text-center text-sm text-muted print:hidden">
        Questions? Call Main Hall at{" "}
        <a href={company.phoneHref} className="text-copper">
          {company.phone}
        </a>{" "}
        or reply to any of our emails.
      </footer>
    </>
  );
}
