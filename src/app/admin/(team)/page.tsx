import { PeopleList } from "@/components/admin/PeopleList";
import { listEvents, listPeople, unreadChatCounts } from "@/lib/repo";

export const metadata = { title: { absolute: "People — Main Hall Team" } };

export default async function AdminHomePage() {
  const [people, events, unreadChat] = await Promise.all([listPeople(), listEvents(), unreadChatCounts()]);
  return <PeopleList people={people} events={events} unreadChat={unreadChat} />;
}
