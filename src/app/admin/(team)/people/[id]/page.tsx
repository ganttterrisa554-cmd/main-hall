import { notFound } from "next/navigation";
import { PersonDetail } from "@/components/admin/PersonDetail";
import { getTeamMember } from "@/data/team";
import { listEmailsForPerson } from "@/lib/mail";
import { siteOrigin } from "@/lib/origin";
import { getEvent, getJobForPerson, getPerson } from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const person = await getPerson((await params).id);
  return { title: person?.name ?? "Person" };
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  const [event, job, emails, origin] = await Promise.all([
    person.eventId ? getEvent(person.eventId) : null,
    getJobForPerson(person.id),
    listEmailsForPerson(person.id),
    siteOrigin(),
  ]);

  const member = event ? getTeamMember(event.producerId) : undefined;

  return (
    <PersonDetail
      person={person}
      event={event}
      job={job}
      jobUrl={job ? `${origin}/partners/jobs/${job.id}` : null}
      producer={member ? { id: member.id, name: member.name, photo: member.photo } : null}
      emails={emails}
    />
  );
}
