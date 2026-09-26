import { PeopleList } from "@/components/admin/PeopleList";
import { listEvents, listPeople } from "@/lib/repo";

export const metadata = { title: { absolute: "People — Main Hall Team" } };

export default async function AdminHomePage() {
  const [people, events] = await Promise.all([listPeople(), listEvents()]);
  return <PeopleList people={people} events={events} />;
}
