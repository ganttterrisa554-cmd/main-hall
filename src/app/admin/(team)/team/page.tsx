import { TeamProfiles } from "@/components/admin/TeamProfiles";
import { listEvents, listPeople } from "@/lib/repo";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const [people, events] = await Promise.all([listPeople(), listEvents()]);
  return <TeamProfiles people={people} events={events} />;
}
