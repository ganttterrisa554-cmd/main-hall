import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { loginTeam } from "@/app/admin/actions";

export const metadata = { title: "Team login" };

export default async function TeamLoginPage() {
  const user = await getCurrentUser();
  if (user?.kind === "team") redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 py-16">
      <div className="w-full max-w-sm bg-mist p-8">
        <p className="flex items-baseline gap-3">
          <span className="font-display text-xl tracking-[0.18em] text-ink uppercase">Main Hall</span>
          <span className="text-xs tracking-[0.14em] text-copper uppercase">Team</span>
        </p>
        <h1 className="font-display mt-6 text-2xl text-ink">Log in</h1>
        <LoginForm action={loginTeam} />
      </div>
    </div>
  );
}
