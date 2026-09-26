"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatMoney, getRole } from "@/data/admin";
import { createSession, destroySession, requirePartner } from "@/lib/auth";
import { mailSettings, sendEmail } from "@/lib/mail";
import { siteOrigin } from "@/lib/origin";
import { hashPassword, verifyPassword } from "@/lib/password";
import { findUserByEmail, getEvent, getJob, getPerson, logActivity, setStage, submitQuote, updatePassword } from "@/lib/repo";

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
  const notes = text(form, "notes");

  await submitQuote(job.id, amount, includes, notes);
  const person = await getPerson(job.personId);
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
