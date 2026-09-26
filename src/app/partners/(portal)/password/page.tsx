import { PasswordForm } from "@/components/auth/LoginForm";
import { requirePartner } from "@/lib/auth";
import { setPartnerPassword } from "@/app/partners/actions";

export const metadata = { title: "Choose your password" };

export default async function PartnerPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requirePartner();
  const { next } = await searchParams;
  const first = user.name.split(" ")[0];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">
        {user.mustChangePassword ? `Welcome, ${first}` : "Change your password"}
      </h1>
      <p className="mt-2 text-muted">
        {user.mustChangePassword
          ? "Choose your own password to replace the temporary one. Then you'll see your job and quote request."
          : "Pick a new password for your partner login."}
      </p>
      <PasswordForm action={setPartnerPassword} next={next} minLength={8} button="Save and continue" />
    </div>
  );
}
