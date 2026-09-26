import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { loginPartner } from "@/app/partners/actions";

export const metadata = { title: "Log in" };

export default async function PartnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user?.kind === "partner") redirect(next?.startsWith("/partners") ? next : "/partners");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl tracking-[0.18em] text-ink uppercase">
          Main Hall
        </Link>
        <h1 className="font-display mt-8 text-3xl text-ink">Partner login</h1>
        <p className="mt-2 text-muted">
          Use the email and temporary password from your welcome email.
        </p>
        <LoginForm action={loginPartner} next={next} />
      </div>
    </div>
  );
}
