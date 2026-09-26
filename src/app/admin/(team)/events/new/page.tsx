import { NewEventForm } from "@/components/admin/NewEventForm";
import { team } from "@/data/team";

export const metadata = { title: "New event" };

export default function NewEventPage() {
  return <NewEventForm producers={team.map((m) => ({ id: m.id, name: m.name, role: m.role }))} />;
}
