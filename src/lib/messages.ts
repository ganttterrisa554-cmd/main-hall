import { formatLong, formatShort, sender, type Role, type StaffEvent } from "@/data/admin";

export function buildPartnerWelcome(input: {
  name: string;
  email: string;
  event: StaffEvent;
  role: Role | undefined;
  quoteDue: string;
  jobUrl: string;
  loginUrl: string;
  tempPassword: string;
}) {
  const first = input.name.trim().split(" ")[0] || "there";
  const { event, role } = input;
  const subject = `You're in: ${role?.title ?? "your role"} at ${event.client}, ${formatShort(event.date)}`;

  const body = [
    `Hi ${first},`,
    "",
    `Great to have you on board for ${event.client}'s ${event.name}. Everything you need is in your Main Hall partner portal.`,
    "",
    "THE JOB",
    `${role?.title ?? "Your role"}: ${role?.brief ?? ""}`.trim(),
    `${formatLong(event.date)} · ${event.venue}, ${event.city}, ${event.state}`,
    `About ${event.guests} guests`,
    "",
    "YOUR QUOTE",
    `Please send your quote by ${formatLong(input.quoteDue)}. Open the job and fill in your price and what's included:`,
    input.jobUrl,
    "",
    "YOUR LOGIN",
    `Portal: ${input.loginUrl}`,
    `Email: ${input.email}`,
    `Temporary password: ${input.tempPassword}`,
    "You'll choose your own password the first time you log in.",
    "",
    "I've attached the event brief and on-site guide — the full pack (agreement, quote form) is in your portal.",
    "",
    "Any questions, just reply to this email.",
    "",
    "Thanks,",
    sender.name,
    `${sender.title}, Main Hall`,
    `${sender.phone} · ${sender.email}`,
  ];

  return { subject, body: body.join("\n") };
}
