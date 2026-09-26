import { company } from "@/data/company";

export type Stage = "found" | "invited" | "agreed" | "quoted" | "booked" | "declined";

export const stages: { key: Stage; label: string; next: string }[] = [
  { key: "found", label: "Found", next: "Send them the invitation" },
  { key: "invited", label: "Invited", next: "Waiting for their reply" },
  { key: "agreed", label: "Said yes", next: "Login and quote request sent, waiting for their quote" },
  { key: "quoted", label: "Quote in", next: "Review the quote and confirm" },
  { key: "booked", label: "Booked", next: "Confirmed for the event" },
  { key: "declined", label: "Not going ahead", next: "No action needed" },
];

export const pipelineStages = stages.filter((s) => s.key !== "declined");

export function stageInfo(stage: Stage) {
  return stages.find((s) => s.key === stage)!;
}

export type Role = { id: string; title: string; brief: string };

export type StaffEvent = {
  id: string;
  client: string;
  name: string;
  date: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  guests: number;
  producerId: string;
  arriveTime: string;
  roles: Role[];
};

export function getRole(event: StaffEvent | undefined | null, roleId: string) {
  return event?.roles.find((r) => r.id === roleId);
}

export type Activity = { at: string; text: string };

export type Prospect = {
  id: string;
  name: string;
  headline: string;
  city: string;
  email: string;
  phone: string;
  jobgetUrl: string;
  highlights: string[];
  notes: string;
  eventId: string;
  roleId: string;
  stage: Stage;
  producerId: string;
  hasLogin: boolean;
  activity: Activity[];
};

export type QuoteStatus = "requested" | "submitted" | "accepted" | "declined";

export type Job = {
  id: string;
  personId: string;
  eventId: string;
  roleId: string;
  quoteDue: string;
  quoteStatus: QuoteStatus;
  quoteAmount: number | null;
  quoteIncludes: string;
  quoteNotes: string;
  quoteSubmittedAt: string | null;
};

export const sender = {
  name: "Maya Okafor",
  title: "Producer",
  phone: company.phone,
  email: "maya@mainhallevents.com",
};

export function formatShort(iso: string) {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatLong(iso: string) {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildInvitation(
  p: Pick<Prospect, "name" | "highlights" | "roleId">,
  event: StaffEvent | undefined | null,
) {
  const role = getRole(event, p.roleId);
  const first = p.name.trim().split(" ")[0] || "there";
  const highlights = p.highlights.map((h) => h.trim()).filter(Boolean);

  const subject = `${role?.title ?? "Freelance work"} for a corporate event in ${event?.city ?? "your area"}`;

  const lines = [
    `Hi ${first},`,
    "",
    `I'm ${sender.name.split(" ")[0]} from Main Hall. We plan corporate events across the US. I came across your profile on JobGet and your experience stood out${highlights.length ? ":" : "."}`,
    ...highlights.map((h) => `• ${h}`),
    "",
    event
      ? `We're planning ${event.client}'s ${event.name} in ${event.city} on ${formatLong(event.date)}, for about ${event.guests} guests.${role ? ` We need someone to ${role.brief}.` : ""}`
      : "",
    "",
    "It's freelance work for this one event.",
    "",
    `Would you like to hear more? Just reply "yes" and I'll send you the full details and ask for your quote. There's no commitment at this stage.`,
    "",
    "Thanks,",
    sender.name,
    `${sender.title}, Main Hall`,
    `${sender.phone} · ${sender.email}`,
  ];

  return { subject, body: lines.join("\n").replace(/\n{3,}/g, "\n\n") };
}
