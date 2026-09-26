import Link from "next/link";
import { ComposeForm } from "@/components/admin/inbox/ComposeForm";
import { getPerson } from "@/lib/repo";

export const metadata = { title: "New email" };

export default async function NewEmailPage({ searchParams }: { searchParams: Promise<{ person?: string }> }) {
  const { person: personId } = await searchParams;
  const person = personId ? await getPerson(personId) : null;

  return (
    <div>
      <Link href="/admin/inbox" className="text-sm text-muted transition hover:text-copper">
        ← Inbox
      </Link>
      <h1 className="font-display mt-6 text-3xl text-ink">New email</h1>
      <ComposeForm
        to={person?.email ?? ""}
        personId={person?.id ?? ""}
        greeting={person ? `Hi ${person.name.split(" ")[0]},\n\n` : ""}
      />
    </div>
  );
}
