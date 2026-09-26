import Link from "next/link";
import { NewPersonForm } from "@/components/admin/NewPersonForm";
import { listEvents } from "@/lib/repo";

export const metadata = { title: "Add person" };

export default async function NewPersonPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string; role?: string }>;
}) {
  const [{ event, role }, events] = await Promise.all([searchParams, listEvents()]);

  if (events.length === 0) {
    return (
      <p className="text-muted">
        Create an event first, so you can pick which job they&apos;re for.{" "}
        <Link href="/admin/events/new" className="text-copper">
          New event →
        </Link>
      </p>
    );
  }

  return <NewPersonForm events={events} initialEventId={event} initialRoleId={role} />;
}
