export const TODAY = "2026-09-26";

export const partner = {
  name: "Lumen Stage & Sound",
  contact: "Dana Whitfield",
  producer: { name: "Maya Okafor", phone: "(512) 555-0142" },
};

export type Offer = {
  id: string;
  client: string;
  event: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  need: string;
  quoteDue: string;
  briefHref?: string;
};

export const offers: Offer[] = [
  {
    id: "offer-101",
    client: "Solstice Energy",
    event: "Fall Leadership Summit",
    date: "2026-10-22",
    venue: "Moody Theater",
    city: "Austin",
    state: "TX",
    need: "Stage sound, 3 LED screens, and projectors for 2 side rooms. About 650 guests.",
    quoteDue: "2026-09-30",
    briefHref: "/partners/pack/brief",
  },
  {
    id: "offer-102",
    client: "Redwood Payments",
    event: "Partner Awards Gala",
    date: "2026-11-14",
    venue: "Kay Bailey Hutchison Convention Center",
    city: "Dallas",
    state: "TX",
    need: "Awards-night lighting, music for winners walking up, and 2 cameras for the big screens. About 900 guests.",
    quoteDue: "2026-10-03",
  },
];

export type Job = {
  id: string;
  client: string;
  event: string;
  date: string;
  venue: string;
  address: string;
  arrive: string;
  finish: string;
  dock: string;
  dayContact: { name: string; phone: string };
  files: string[];
};

export const jobs: Job[] = [
  {
    id: "bk-201",
    client: "Quill & Circuit",
    event: "Product Launch Night",
    date: "2026-10-09",
    venue: "Long Center for the Performing Arts",
    address: "701 W Riverside Dr, Austin, TX 78704",
    arrive: "Thu, Oct 8 · 2:00 PM",
    finish: "Fri, Oct 9 · 11:30 PM",
    dock: "Use Dock B off Riverside Dr. Trucks up to 26 ft. Check in at the security gate.",
    dayContact: { name: "Maya Okafor", phone: "(512) 555-0142" },
    files: ["Stage plan.pdf", "Event schedule.pdf"],
  },
  {
    id: "bk-202",
    client: "Summitline Software",
    event: "Customer Summit",
    date: "2026-10-16",
    venue: "Austin Convention Center",
    address: "500 E Cesar Chavez St, Austin, TX 78701",
    arrive: "Thu, Oct 15 · 8:00 AM",
    finish: "Sat, Oct 17 · 9:00 PM",
    dock: "Loading docks 1–4 on Red River St. Wait in the truck yard on 4th St until called.",
    dayContact: { name: "Jordan Pike", phone: "(512) 555-0118" },
    files: ["Main stage plan.pdf", "Room list.pdf"],
  },
  {
    id: "bk-203",
    client: "Beaconfield Foods",
    event: "Holiday Gala",
    date: "2026-12-11",
    venue: "Henry B. González Convention Center",
    address: "900 E Market St, San Antonio, TX 78205",
    arrive: "Fri, Dec 11 · 9:00 AM",
    finish: "Sat, Dec 12 · 1:00 AM",
    dock: "Dock 3 on Market St. Freight elevator up to the ballroom.",
    dayContact: { name: "Maya Okafor", phone: "(512) 555-0142" },
    files: ["Ballroom layout.pdf"],
  },
];

export type Paperwork = { id: string; name: string; expires: string };

export const paperwork: Paperwork[] = [
  { id: "doc-auto", name: "Vehicle insurance", expires: "2026-09-01" },
  { id: "doc-gl", name: "Liability insurance", expires: "2026-10-08" },
  { id: "doc-wc", name: "Workers' comp insurance", expires: "2027-03-31" },
];

export type Payment = {
  id: string;
  label: string;
  amount: number;
  status: "paid" | "coming" | "checking";
  date?: string;
};

export const payments: Payment[] = [
  {
    id: "pay-1",
    label: "Quill & Circuit · deposit",
    amount: 12500,
    status: "coming",
    date: "2026-10-01",
  },
  {
    id: "pay-2",
    label: "Summitline Software · deposit",
    amount: 24000,
    status: "coming",
    date: "2026-10-05",
  },
  {
    id: "pay-3",
    label: "Summitline Software · extra room equipment",
    amount: 3850,
    status: "checking",
  },
  {
    id: "pay-4",
    label: "Vesper Analytics · final payment",
    amount: 41200,
    status: "paid",
    date: "2026-09-05",
  },
];

export function daysUntil(iso: string): number {
  const ms = Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${TODAY}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function mapLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function getJob(id: string): Job | undefined {
  return jobs.find((j) => j.id === id);
}

export const paperworkToFix = paperwork.filter((p) => daysUntil(p.expires) <= 30);
