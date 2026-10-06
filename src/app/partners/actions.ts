"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatMoney, getRole } from "@/data/admin";
import { createSession, destroySession, requirePartner } from "@/lib/auth";
import { mailSettings, sendEmail } from "@/lib/mail";
import { siteOrigin } from "@/lib/origin";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  addChatMessage,
  findUserByEmail,
  getEvent,
  getJob,
  getPerson,
  logActivity,
  savePayment,
  saveSignature,
  saveW9,
  setStage,
  submitQuote,
  updatePassword,
  updatePerson,
} from "@/lib/repo";
import { encrypt, secretsConfigured } from "@/lib/secrets";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export type FormState = { error?: string; ok?: string } | undefined;

export async function loginPartner(_: FormState, form: FormData): Promise<FormState> {
  const user = await findUserByEmail(text(form, "email"));
  const ok =
    user && user.kind === "partner" && (await verifyPassword(text(form, "password"), String(user.password_hash)));
  if (!ok) return { error: "That email and password don't match. Check the email we sent you." };
  await createSession(String(user.id));
  const next = text(form, "next");
  if (user.must_change_password) redirect(`/partners/password${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  redirect(next.startsWith("/partners") ? next : "/partners");
}

export async function logoutPartner() {
  await destroySession();
  redirect("/partners/login");
}

export async function setPartnerPassword(_: FormState, form: FormData): Promise<FormState> {
  const user = await requirePartner();
  const next = text(form, "password");
  if (next.length < 8) return { error: "Use at least 8 characters." };
  if (next !== text(form, "confirm")) return { error: "The two passwords don't match." };
  await updatePassword(user.id, await hashPassword(next));
  const dest = text(form, "next");
  redirect(dest.startsWith("/partners") ? dest : "/partners");
}

export async function sendQuote(_: FormState, form: FormData): Promise<FormState> {
  const user = await requirePartner();
  const job = await getJob(text(form, "jobId"));
  if (!job || job.personId !== user.personId) return { error: "We couldn't find this job." };
  if (job.quoteStatus !== "requested") return { error: "You've already sent your quote for this job." };

  const amount = Number(text(form, "amount").replace(/[^0-9.]/g, ""));
  if (!amount || amount < 1) return { error: "Enter your total price." };
  const includes = text(form, "includes");
  if (!includes) return { error: "Tell us what your price includes." };
  const phone = text(form, "phone");
  if (phone.replace(/\D/g, "").length < 7) return { error: "Add a phone number we can reach you on." };
  const notes = text(form, "notes");

  await submitQuote(job.id, amount, includes, notes);
  const person = await getPerson(job.personId);
  if (person && person.phone !== phone) await updatePerson(person.id, { phone });
  if (person && (person.stage === "agreed" || person.stage === "invited")) {
    await setStage(person.id, "quoted", `Quote received: ${formatMoney(amount)}`);
  } else if (person) {
    await logActivity(person.id, `Quote received: ${formatMoney(amount)}`);
  }

  const event = await getEvent(job.eventId);
  const role = getRole(event, job.roleId);
  const origin = await siteOrigin();
  const teamInbox = process.env.TEAM_NOTIFY_EMAIL?.trim();
  if (person && teamInbox) {
    await sendEmail({
      to: teamInbox,
      subject: `Quote in: ${person.name} · ${formatMoney(amount)} · ${event?.client ?? ""}`,
      text: [
        `${person.name} sent their quote for ${role?.title ?? "the job"} at ${event?.client} (${event?.city}).`,
        "",
        `Total: ${formatMoney(amount)}`,
        `Includes: ${includes}`,
        `Phone: ${phone}`,
        notes ? `Notes: ${notes}` : "",
        "",
        `Review it: ${origin}/admin/people/${person.id}`,
      ]
        .filter((l) => l !== "")
        .join("\n"),
      personId: person.id,
      fromName: mailSettings().testMode ? undefined : "Main Hall Portal",
    });
  }

  revalidatePath(`/partners/jobs/${job.id}`);
  revalidatePath("/partners");
  revalidatePath("/admin");
  return { ok: "Quote sent. We'll be in touch within two business days." };
}

const lettersOnly = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

export async function signAgreement(_: FormState, form: FormData): Promise<FormState> {
  const user = await requirePartner();
  if (!user.personId) return { error: "We couldn't find your profile." };
  const doc = text(form, "doc") === "booking" ? "booking" : "agreement";

  const person = await getPerson(user.personId);
  if (!person) return { error: "We couldn't find your profile." };

  const typed = text(form, "name");
  if (lettersOnly(typed) !== lettersOnly(person.name)) {
    return { error: `Please type your name exactly as it appears: ${person.name}` };
  }

  await saveSignature(person.id, doc, typed);
  await logActivity(person.id, doc === "booking" ? "Accepted booking confirmation" : "Signed contractor agreement");
  revalidatePath("/partners");
  revalidatePath(`/partners/pack/${doc}`);
  return { ok: doc === "booking" ? "Accepted" : "Signed" };
}

const W9_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const W9_MAX_BYTES = 5 * 1024 * 1024;

export async function uploadW9(_: FormState, form: FormData): Promise<FormState> {
  const user = await requirePartner();
  if (!user.personId) return { error: "We couldn't find your profile." };

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose your W-9 file first." };
  if (!W9_TYPES.has(file.type)) return { error: "Upload a PDF, JPG, or PNG." };
  if (file.size > W9_MAX_BYTES) return { error: "Files must be under 5 MB." };

  await saveW9(user.personId, file.name, file.type, Buffer.from(await file.arrayBuffer()));
  await logActivity(user.personId, "Uploaded W-9");
  revalidatePath("/partners");
  revalidatePath("/partners/details");
  return { ok: "W-9 uploaded." };
}

export async function savePaymentDetails(_: FormState, form: FormData): Promise<FormState> {
  const user = await requirePartner();
  if (!user.personId) return { error: "We couldn't find your profile." };
  if (!secretsConfigured()) {
    return { error: "Payment details are temporarily unavailable — call your producer." };
  }

  const accountName = text(form, "accountName");
  const bank = text(form, "bank");
  const routing = text(form, "routing").replace(/\s/g, "");
  const account = text(form, "account").replace(/\s/g, "");

  if (!accountName) return { error: "Enter the account holder name." };
  if (!bank) return { error: "Enter your bank's name." };
  if (!/^\d{9}$/.test(routing)) return { error: "Routing numbers are exactly 9 digits." };
  if (!/^\d{6,17}$/.test(account)) return { error: "Check the account number — 6 to 17 digits." };

  await savePayment(user.personId, {
    accountName,
    bank,
    routingEnc: encrypt(routing),
    accountEnc: encrypt(account),
    last4: account.slice(-4),
  });
  await logActivity(user.personId, "Added payment details");
  revalidatePath("/partners");
  revalidatePath("/partners/details");
  return { ok: "Payment details saved." };
}

export async function sendChatMessage(_: FormState, form: FormData): Promise<FormState> {
  const user = await requirePartner();
  if (!user.personId) return { error: "We couldn't find your profile." };
  const body = text(form, "body");
  if (!body) return { error: "Write a message first." };
  if (body.length > 2000) return { error: "Keep it under 2,000 characters." };
  const person = await getPerson(user.personId);
  if (!person) return { error: "We couldn't find your profile." };

  await addChatMessage(person.id, "in", body, person.name);

  const teamInbox = process.env.TEAM_NOTIFY_EMAIL?.trim();
  if (teamInbox) {
    const origin = await siteOrigin();
    await sendEmail({
      to: teamInbox,
      subject: `Chat: ${person.name}`,
      text: `${person.name} sent a message in the partner portal:\n\n"${body}"\n\nReply: ${origin}/admin/people/${person.id}`,
      personId: person.id,
      fromName: mailSettings().testMode ? undefined : "Main Hall Portal",
    }).catch(() => {});
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/people/${person.id}`);
  return { ok: "Sent" };
}
