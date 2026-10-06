import { redirect } from "next/navigation";
import { cache } from "react";
import { getRole, type Job, type Prospect, type Role, type StaffEvent } from "@/data/admin";
import { company } from "@/data/company";
import { getTeamMember } from "@/data/team";
import { requirePartner, type User } from "@/lib/auth";
import { getEvent, getPerson, listJobsForPerson } from "@/lib/repo";

export type PackProducer = {
  name: string;
  firstName: string;
  role: string;
  phone: string;
  email: string;
};

export type LoadedPack = {
  user: User;
  person: Prospect | null;
  job: Job | null;
  event: StaffEvent | null;
  role: Role | null;
  producer: PackProducer;
  quoteDue: string;
};

export function pickCurrentJob(jobs: Job[]): Job | null {
  return (
    jobs.find((j) => j.quoteStatus === "requested") ??
    jobs.find((j) => j.quoteStatus === "accepted") ??
    jobs.find((j) => j.quoteStatus === "submitted") ??
    jobs[0] ??
    null
  );
}

const fallbackProducer: PackProducer = {
  name: company.name,
  firstName: "Your producer",
  role: company.name,
  phone: company.phone,
  email: company.email,
};

export const loadPartnerPack = cache(async (): Promise<LoadedPack> => {
  const user = await requirePartner();
  if (user.mustChangePassword) redirect("/partners/password?next=/partners/pack");

  const person = user.personId ? await getPerson(user.personId) : null;
  const jobs = user.personId ? await listJobsForPerson(user.personId) : [];
  const job = pickCurrentJob(jobs);
  const event = job ? await getEvent(job.eventId) : null;
  const role = getRole(event, job?.roleId ?? "") ?? null;

  const member = event ? getTeamMember(event.producerId) : undefined;
  const producer: PackProducer = member
    ? {
        name: member.name,
        firstName: member.name.split(" ")[0],
        role: member.role,
        phone: member.phone,
        email: member.email,
      }
    : fallbackProducer;

  return { user, person, job, event, role, producer, quoteDue: job?.quoteDue ?? "" };
});
