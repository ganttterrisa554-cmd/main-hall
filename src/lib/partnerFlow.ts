import { getRole } from "@/data/admin";
import { sendEmail } from "@/lib/mail";
import { buildPartnerWelcome } from "@/lib/messages";
import { generateTempPassword, hashPassword } from "@/lib/password";
import { createJob, getEvent, getJobForPerson, getPerson, logActivity, setStage, upsertPartnerUser } from "@/lib/repo";

export type AgreedResult = {
  error?: string;
  jobUrl?: string;
  loginUrl?: string;
  email?: string;
  tempPassword?: string;
  emailStatus?: "sent" | "failed" | "not_sent";
  emailError?: string;
  subject?: string;
  body?: string;
};

export function quoteDueDate(eventDate: string) {
  const inFourDays = new Date(Date.now() + 4 * 86400000);
  const threeWeeksBefore = new Date(`${eventDate}T12:00:00Z`);
  threeWeeksBefore.setUTCDate(threeWeeksBefore.getUTCDate() - 21);
  const due = threeWeeksBefore > inFourDays ? inFourDays : threeWeeksBefore;
  const floor = new Date(Date.now() + 86400000);
  return (due < floor ? floor : due).toISOString().slice(0, 10);
}

/** Creates the job page, quote request, and partner login, then emails them the details. */
export async function setUpPartner(personId: string, origin: string): Promise<AgreedResult> {
  const person = await getPerson(personId);
  if (!person) return { error: "We couldn't find this person." };
  if (!person.email) return { error: "Add their email first so we can create their login." };
  const tempPassword = generateTempPassword(person.name);
  const [event, existingJob, passwordHash] = await Promise.all([
    getEvent(person.eventId),
    getJobForPerson(person.id),
    hashPassword(tempPassword),
  ]);
  if (!event) return { error: "Pick an event for them first." };
  const role = getRole(event, person.roleId);

  const [jobId] = await Promise.all([
    existingJob?.id ?? createJob(person, event, role?.title ?? "job", quoteDueDate(event.date)),
    upsertPartnerUser(person, passwordHash),
  ]);
  const quoteDue = existingJob?.quoteDue ?? quoteDueDate(event.date);

  const jobUrl = `${origin}/partners/jobs/${jobId}`;
  const loginUrl = `${origin}/partners/login`;
  const message = buildPartnerWelcome({
    name: person.name,
    email: person.email,
    event,
    role,
    quoteDue,
    jobUrl,
    loginUrl,
    tempPassword,
  });

  const sent = await sendEmail({ to: person.email, subject: message.subject, text: message.body, personId: person.id });

  if (person.stage === "found" || person.stage === "invited") await setStage(person.id, "agreed", "Said yes");
  await logActivity(
    person.id,
    sent.status === "sent"
      ? "Job, quote request, and login emailed"
      : "Job, quote request, and login created (email not sent)",
  );

  return {
    jobUrl,
    loginUrl,
    email: person.email,
    tempPassword,
    emailStatus: sent.status,
    emailError: sent.error,
    subject: message.subject,
    body: message.body,
  };
}
