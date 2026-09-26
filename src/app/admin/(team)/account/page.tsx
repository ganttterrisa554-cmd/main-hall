import { PasswordForm } from "@/components/auth/LoginForm";
import { requireTeam } from "@/lib/auth";
import { mailSettings } from "@/lib/mail";
import { changeTeamPassword } from "@/app/admin/actions";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireTeam();
  const mail = mailSettings();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Account</h1>
      <p className="mt-2 text-muted">Logged in as {user.email}</p>

      {user.mustChangePassword && (
        <p className="mt-6 max-w-lg bg-copper/10 px-4 py-3 text-sm text-ink">
          You&apos;re using the temporary password from setup. Choose your own below.
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">Change password</h2>
        <PasswordForm action={changeTeamPassword} minLength={10} button="Update password" />
      </section>

      <section className="mt-12 max-w-lg">
        <h2 className="font-display text-xl text-ink">Email connection</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
            <dt className="text-muted">Resend</dt>
            <dd className={mail.configured ? "text-emerald-800" : "text-copper"}>
              {mail.configured ? "Connected" : "Not connected: add RESEND_API_KEY"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
            <dt className="text-muted">Sending from</dt>
            <dd className="text-ink">{mail.from}</dd>
          </div>
          {mail.testMode && (
            <p className="pt-1 text-xs leading-relaxed text-muted">
              Test mode: Resend only delivers to your own Resend signup email until you verify a domain and set
              EMAIL_FROM.
            </p>
          )}
        </dl>
      </section>
    </div>
  );
}
