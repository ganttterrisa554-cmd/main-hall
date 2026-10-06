"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildInvitation, formatMoney, sender, type Stage } from "@/data/admin";
import { team } from "@/data/team";
import { createSession, destroySession, requireTeam } from "@/lib/auth";
import { emailHistoryFor, pullInboundEmails, sendEmail } from "@/lib/mail";
import { siteOrigin } from "@/lib/origin";
import { setUpPartner, type AgreedResult } from "@/lib/partnerFlow";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createEvent,
  createPerson,
  findPersonByEmail,
  findUserByEmail,
  getEvent,
  getJobForPerson,
  getPerson,
  logActivity,
  setQuoteStatus,
  setStage,
  updatePassword,
} from "@/lib/repo";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export type FormState = { error?: string; ok?: string } | undefined;

export async function loginTeam(_: FormState, form: FormData): Promise<FormState> {
  const user = await findUserByEmail(text(form, "email"));
  const ok = user && user.kind === "team" && (await verifyPassword(text(form, "password"), String(user.password_hash)));
  if (!ok) return { error: "That email and password don't match." };
  await createSession(String(user.id));
  redirect(user.must_change_password ? "/admin/account?first=1" : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changeTeamPassword(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireTeam();
  const next = text(form, "password");
  if (next.length < 10) return { error: "Use at least 10 characters." };
  if (next !== text(form, "confirm")) return { error: "The two passwords don't match." };
  await updatePassword(user.id, await hashPassword(next));
  return { ok: "Password updated." };
}

export async function addPerson(_: FormState, form: FormData): Promise<FormState> {
  await requireTeam();
  const name = text(form, "name");
  if (name.length < 2) return { error: "Add their name." };
  const email = text(form, "email");
  if (email) {
    const existing = await findPersonByEmail(email);
    if (existing) return { error: `${email} is already saved as ${existing.name} — see their page instead.` };
  }
  const invited = text(form, "intent") === "invited";
  const id = await createPerson({
    name,
    headline: text(form, "headline"),
    city: text(form, "city"),
    email,
    phone: text(form, "phone"),
    jobgetUrl: text(form, "jobgetUrl"),
    highlights: form.getAll("highlight").map(String).map((h) => h.trim()).filter(Boolean),
    notes: text(form, "notes"),
    eventId: text(form, "eventId"),
    roleId: text(form, "roleId"),
    stage: invited ? "invited" : "found",
  });
  await logActivity(id, "Added from JobGet");
  if (invited) await logActivity(id, "Invitation sent");
  revalidatePath("/admin");
  redirect(`/admin/people/${id}`);
}

export async function moveStage(personId: string, stage: Stage, note: string) {
  await requireTeam();
  await setStage(personId, stage, note);
  revalidatePath(`/admin/people/${personId}`);
  revalidatePath("/admin");
}

export async function sendInvitation(personId: string): Promise<FormState> {
  await requireTeam();
  const person = await getPerson(personId);
  if (!person) return { error: "We couldn't find this person." };
  if (!person.email) return { error: "Add their email first." };
  const prior = (await emailHistoryFor(person.email)).filter((m) => m.status !== "failed");
  if (prior.length) {
    const last = prior[0];
    return { error: `Already emailed ${person.email} on ${last.createdAt.slice(0, 10)} ("${last.subject}"). Find the thread in the inbox to follow up.` };
  }
  const event = await getEvent(person.eventId);
  const invitation = buildInvitation(person, event);
  const sent = await sendEmail({
    to: person.email,
    subject: invitation.subject,
    text: invitation.body,
    personId: person.id,
    fromName: sender.name,
  });
  revalidatePath("/admin/inbox");
  if (sent.status !== "sent") {
    revalidatePath(`/admin/people/${person.id}`);
    return { error: sent.error || "Sending failed." };
  }
  await setStage(person.id, "invited", "Invitation emailed");
  revalidatePath(`/admin/people/${person.id}`);
  revalidatePath("/admin");
  return { ok: "Invitation sent." };
}

export async function markAgreed(personId: string): Promise<AgreedResult> {
  await requireTeam();
  const result = await setUpPartner(personId, await siteOrigin());
  if (!result.error) {
    revalidatePath(`/admin/people/${personId}`);
    revalidatePath("/admin");
    revalidatePath("/admin/inbox");
  }
  return result;
}

export async function acceptQuote(personId: string) {
  await requireTeam();
  const job = await getJobForPerson(personId);
  if (job) await setQuoteStatus(job.id, "accepted");
  await setStage(personId, "booked", `Booking confirmed${job?.quoteAmount ? ` at ${formatMoney(job.quoteAmount)}` : ""}`);
  revalidatePath(`/admin/people/${personId}`);
  revalidatePath("/admin");
}

export async function declineQuote(personId: string) {
  await requireTeam();
  const job = await getJobForPerson(personId);
  if (job) await setQuoteStatus(job.id, "declined");
  await setStage(personId, "declined", "Quote not accepted");
  revalidatePath(`/admin/people/${personId}`);
  revalidatePath("/admin");
}

export async function addEvent(_: FormState, form: FormData): Promise<FormState> {
  await requireTeam();
  const titles = form.getAll("roleTitle").map(String);
  const briefs = form.getAll("roleBrief").map(String);
  const roles = titles
    .map((title, i) => ({ title: title.trim(), brief: (briefs[i] ?? "").trim() }))
    .filter((r) => r.title)
    .map((r, i) => ({
      id: r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `role-${i + 1}`,
      ...r,
    }));

  const required = ["client", "name", "date", "venue", "city", "state"] as const;
  for (const key of required) if (!text(form, key)) return { error: "Fill in the client, event name, date, venue, city, and state." };
  if (roles.length === 0) return { error: "Add at least one role you need to fill." };
  const producerId = text(form, "producerId");
  if (!team.some((m) => m.id === producerId)) return { error: "Pick a producer." };

  const id = await createEvent({
    client: text(form, "client"),
    name: text(form, "name"),
    date: text(form, "date"),
    venue: text(form, "venue"),
    address: text(form, "address"),
    city: text(form, "city"),
    state: text(form, "state").toUpperCase().slice(0, 2),
    guests: Number(text(form, "guests")) || 0,
    producerId,
    arriveTime: text(form, "arriveTime"),
    roles,
  });
  revalidatePath("/admin/events");
  redirect(`/admin/events/${id}?created=1`);
}

export async function composeEmail(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireTeam();
  const to = text(form, "to");
  const subject = text(form, "subject");
  const body = text(form, "body");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { error: "Enter a valid email address." };
  if (!subject || !body) return { error: "Add a subject and a message." };
  const prior = (await emailHistoryFor(to)).filter((m) => m.status !== "failed");
  if (prior.length) {
    const last = prior[0];
    return { error: `Already emailed ${to} on ${last.createdAt.slice(0, 10)} ("${last.subject}"). Open the existing thread to reply instead.` };
  }
  const personId = text(form, "personId") || null;
  const result = await sendEmail({ to, subject, text: body, personId, fromName: user.name });
  if (personId) await logActivity(personId, `Email sent: ${subject}`);
  revalidatePath("/admin/inbox");
  redirect(`/admin/inbox/${result.threadId}`);
}

export async function replyToThread(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireTeam();
  const threadId = text(form, "threadId");
  const to = text(form, "to");
  const body = text(form, "body");
  if (!body) return { error: "Write a reply first." };
  const subjectRaw = text(form, "subject");
  const subject = /^re:/i.test(subjectRaw) ? subjectRaw : `Re: ${subjectRaw}`;
  const personId = text(form, "personId") || null;
  const result = await sendEmail({ to, subject, text: body, threadId, personId, fromName: user.name });
  revalidatePath(`/admin/inbox/${threadId}`);
  revalidatePath("/admin/inbox");
  if (result.status === "failed") return { error: `Saved, but sending failed: ${result.error}` };
  if (result.status === "not_sent") return { error: result.error };
  return { ok: "Reply sent." };
}

export async function checkForNewMail(): Promise<FormState> {
  await requireTeam();
  const result = await pullInboundEmails();
  revalidatePath("/admin/inbox");
  if (result.error) return { error: result.error };
  return { ok: result.added ? `${result.added} new email${result.added === 1 ? "" : "s"}.` : "No new email." };
}
