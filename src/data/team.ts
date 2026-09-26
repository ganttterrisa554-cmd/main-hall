import type { Prospect } from "@/data/admin";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  city: string;
  photo: string;
  since: number;
  bio: string;
  intro: string;
  handles: string[];
  email: string;
  phone: string;
  looksAfter: { one: string; many: string; owns: (p: Prospect) => boolean };
};

const producerOf = (memberId: string) => (p: Prospect) =>
  p.stage !== "declined" && p.producerId === memberId;

export const team: TeamMember[] = [
  {
    id: "maya",
    name: "Maya Okafor",
    role: "Senior Producer",
    city: "Austin, TX",
    photo: "/team/maya-okafor.jpg",
    since: 2019,
    bio: "Runs Main Hall's Texas events, from 300-guest launches to 2,000-person conferences. Ten years in live production before Main Hall, most of it at a Houston AV company.",
    intro: "Ten years in live production. Leads our Texas conferences and launches, from first walkthrough to last cue.",
    handles: ["Conferences", "Product launches", "Texas events"],
    email: "maya@mainhallevents.com",
    phone: "(512) 555-0142",
    looksAfter: {
      one: "person on her events",
      many: "people on her events",
      owns: producerOf("maya"),
    },
  },
  {
    id: "daniel",
    name: "Daniel Reyes",
    role: "Producer",
    city: "Boston, MA",
    photo: "/team/daniel-reyes.jpg",
    since: 2021,
    bio: "Leads our New England dinners and galas. A former hotel banquet manager, so catering, seating, and timing are his home ground.",
    intro: "Former hotel banquet manager. Runs our New England dinners and galas with an eye on every course and cue.",
    handles: ["Galas & dinners", "Catering", "New England events"],
    email: "daniel@mainhallevents.com",
    phone: "(617) 555-0128",
    looksAfter: {
      one: "person on his events",
      many: "people on his events",
      owns: producerOf("daniel"),
    },
  },
  {
    id: "grace",
    name: "Grace Lindqvist",
    role: "Partnerships Lead",
    city: "New York, NY",
    photo: "/team/grace-lindqvist.jpg",
    since: 2023,
    bio: "Finds and vets new partners on JobGet and beyond, and checks references before anyone is booked. If someone new works a Main Hall event, Grace found them.",
    intro: "Builds the network of AV crews, caterers, and photographers behind every Main Hall event.",
    handles: ["Finding partners", "References", "JobGet"],
    email: "grace@mainhallevents.com",
    phone: "(212) 555-0164",
    looksAfter: {
      one: "person waiting on an invitation or reply",
      many: "people waiting on an invitation or reply",
      owns: (p) => p.stage === "found" || p.stage === "invited",
    },
  },
  {
    id: "aisha",
    name: "Aisha Rahman",
    role: "Operations Coordinator",
    city: "Atlanta, GA",
    photo: "/team/aisha-rahman.jpg",
    since: 2022,
    bio: "Keeps partner paperwork in order: logins, agreements, W-9s, and insurance certificates. Chases anything missing well before event day.",
    intro: "Keeps every vendor, contract, and certificate in order, so event day has no surprises.",
    handles: ["Partner logins", "Agreements", "Insurance"],
    email: "aisha@mainhallevents.com",
    phone: "(404) 555-0187",
    looksAfter: {
      one: "new partner setting up",
      many: "new partners setting up",
      owns: (p) => p.stage === "agreed",
    },
  },
  {
    id: "kevin",
    name: "Kevin Cho",
    role: "Finance Manager",
    city: "Chicago, IL",
    photo: "/team/kevin-cho.jpg",
    since: 2020,
    bio: "Makes sure partners get paid on time: deposits, final payments, and year-end 1099s. Any question about an invoice goes to Kevin.",
    intro: "Handles budgets and payments, so clients get clear numbers and partners get paid on time.",
    handles: ["Deposits", "Invoices", "1099s"],
    email: "kevin@mainhallevents.com",
    phone: "(312) 555-0119",
    looksAfter: {
      one: "quote or booking to pay",
      many: "quotes and bookings to pay",
      owns: (p) => p.stage === "quoted" || p.stage === "booked",
    },
  },
];

export function getTeamMember(id: string) {
  return team.find((m) => m.id === id);
}

export function looksAfterLabel(member: TeamMember, count: number) {
  return count === 1 ? member.looksAfter.one : member.looksAfter.many;
}
