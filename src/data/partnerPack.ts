export type PackStage = "before" | "welcome" | "booking" | "yearly";

export type PackDoc = {
  slug: string;
  title: string;
  action: "Read" | "Sign" | "Fill in" | "Reply" | "Accept" | "Keep";
  pages: number;
  summary: string;
  stage: PackStage;
  ref: string;
  date: string;
};

export const invitation: PackDoc = {
  slug: "invitation",
  title: "Job invitation",
  action: "Reply",
  pages: 1,
  summary:
    "The first message you send after finding them on JobGet: the event, what we need, why we picked them, and what happens if they say yes.",
  stage: "before",
  ref: "ATR-INV-0142",
  date: "Sep 24, 2026",
};

export const welcomePack: PackDoc[] = [
  {
    slug: "welcome",
    title: "Welcome & how it works",
    action: "Read",
    pages: 1,
    summary: "The steps from here to getting paid, and who to call.",
    stage: "welcome",
    ref: "ATR-WEL-0142",
    date: "Sep 26, 2026",
  },
  {
    slug: "brief",
    title: "Event brief",
    action: "Read",
    pages: 2,
    summary: "Full details of the job: schedule, scope of work, who provides what.",
    stage: "welcome",
    ref: "ATR-BRF-0147",
    date: "Sep 26, 2026",
  },
  {
    slug: "quote",
    title: "Quote request",
    action: "Fill in",
    pages: 1,
    summary: "What their quote must include, the deadline, and a quote form to fill in.",
    stage: "welcome",
    ref: "ATR-RFQ-0147",
    date: "Sep 26, 2026",
  },
  {
    slug: "agreement",
    title: "Contractor agreement",
    action: "Sign",
    pages: 3,
    summary:
      "Signed once, covers every future job: pay terms, cancellations, insurance, confidentiality.",
    stage: "welcome",
    ref: "ATR-ICA-0142",
    date: "Sep 26, 2026",
  },
  {
    slug: "on-site",
    title: "On-site guide",
    action: "Read",
    pages: 1,
    summary: "Arrival, dress code, conduct, photos, safety, and leaving the venue.",
    stage: "welcome",
    ref: "ATR-OSG-02",
    date: "Sep 26, 2026",
  },
];

export const bookingConfirmation: PackDoc = {
  slug: "booking",
  title: "Booking confirmation",
  action: "Accept",
  pages: 1,
  summary:
    "Sent after you accept their quote, for every job: agreed price, deposit amount and date, final times, and what's still needed.",
  stage: "booking",
  ref: "ATR-BK-0147",
  date: "Oct 1, 2026",
};

export const taxLetter: PackDoc = {
  slug: "tax-letter",
  title: "Year-end tax letter",
  action: "Keep",
  pages: 1,
  summary:
    "Sent in January with their 1099-NEC, only if payments passed the IRS reporting limit. Lists every payment from the year.",
  stage: "yearly",
  ref: "ATR-TAX-2026-0142",
  date: "Jan 15, 2027",
};

export const laterDocs: PackDoc[] = [bookingConfirmation, taxLetter];

export const allDocs: PackDoc[] = [invitation, ...welcomePack, ...laterDocs];

export function findDoc(slug: string): PackDoc | undefined {
  return allDocs.find((d) => d.slug === slug);
}

export type SendBackItem = {
  name: string;
  required: boolean;
  when: string;
  how: string;
  href?: string;
};

export const sendBack: SendBackItem[] = [
  {
    name: "Their quote",
    required: true,
    when: "Every job",
    how: "Filled in using the quote form, by the deadline in the quote request.",
  },
  {
    name: "Signed contractor agreement",
    required: true,
    when: "Once",
    how: "Signed online in the portal.",
  },
  {
    name: "W-9 tax form",
    required: true,
    when: "Once",
    how: "The official IRS form, uploaded to the portal.",
    href: "https://www.irs.gov/forms-pubs/about-form-w-9",
  },
  {
    name: "Payment details",
    required: true,
    when: "Once",
    how: "Bank details for direct deposit, entered in the portal.",
  },
  {
    name: "Insurance certificate",
    required: false,
    when: "Only if they bring their own equipment or crew",
    how: "Liability insurance of at least $1,000,000 per incident, naming Main Hall.",
  },
  {
    name: "Photo ID",
    required: false,
    when: "Only if the venue needs security badges",
    how: "Name and photo ID for each person working on site.",
  },
];

export const pack = {
  preparedFor: "Dana Whitfield",
  business: "Lumen Stage & Sound",
  sentOn: "Sep 24, 2026",
  packOn: "Sep 26, 2026",
  quoteDue: "Wednesday, September 30, 2026, 5:00 PM Central",
  producer: {
    name: "Maya Okafor",
    title: "Producer, Main Hall",
    phone: "(512) 555-0142",
    email: "maya@mainhallevents.com",
  },
  event: {
    client: "Solstice Energy",
    name: "Fall Leadership Summit",
    date: "Thursday, October 22, 2026",
    setup: "Wednesday, October 21, 2026",
    venue: "Moody Theater",
    address: "310 W Willie Nelson Blvd, Austin, TX 78701",
    guests: 650,
  },
  jobgetProfile: [
    "6 years running live sound and LED screens for concerts and conferences in Austin",
    "Owns a digital mixing desk and a wireless microphone kit",
    "Available weekdays and weekends, and can bring a small crew",
  ],
};
