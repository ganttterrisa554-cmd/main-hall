import type { Job } from "@/data/admin";

export type PackStage = "welcome" | "booking";

export type PackDoc = {
  slug: string;
  title: string;
  action: "Read" | "Sign" | "Fill in" | "Reply" | "Accept" | "Keep";
  pages: number;
  summary: string;
  stage: PackStage;
  code: string;
};

export const welcomePack: PackDoc[] = [
  {
    slug: "welcome",
    title: "Welcome & how it works",
    action: "Read",
    pages: 1,
    summary: "The steps from here to getting paid, and who to call.",
    stage: "welcome",
    code: "WEL",
  },
  {
    slug: "brief",
    title: "Event brief",
    action: "Read",
    pages: 2,
    summary: "Full details of your job: date, venue, what we need from you, and who provides what.",
    stage: "welcome",
    code: "BRF",
  },
  {
    slug: "quote",
    title: "Quote request",
    action: "Fill in",
    pages: 1,
    summary: "What your quote should include, the deadline, and where to send it.",
    stage: "welcome",
    code: "RFQ",
  },
  {
    slug: "agreement",
    title: "Contractor agreement",
    action: "Sign",
    pages: 3,
    summary:
      "Signed once, covers every job you do with us: pay terms, cancellations, insurance, confidentiality.",
    stage: "welcome",
    code: "ICA",
  },
  {
    slug: "on-site",
    title: "On-site guide",
    action: "Read",
    pages: 1,
    summary: "Arrival, dress code, conduct, photos, safety, and leaving the venue.",
    stage: "welcome",
    code: "OSG",
  },
];

export const bookingConfirmation: PackDoc = {
  slug: "booking",
  title: "Booking confirmation",
  action: "Accept",
  pages: 1,
  summary:
    "Sent when we accept your quote: your agreed price, deposit amount and date, and what's still needed.",
  stage: "booking",
  code: "BK",
};

export const partnerDocs: PackDoc[] = [...welcomePack, bookingConfirmation];

export function findDoc(slug: string): PackDoc | undefined {
  return partnerDocs.find((d) => d.slug === slug);
}

export function docRef(doc: PackDoc, job: Job): string {
  return `MH-${doc.code}-${job.id.slice(-4).toUpperCase()}`;
}

export function docDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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
    name: "Your quote",
    required: true,
    when: "Every job",
    how: "Filled in using the quote form in your portal, by the deadline in the quote request.",
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
    when: "Only if you bring your own equipment or crew",
    how: "Liability insurance of at least $1,000,000 per incident, naming Main Hall.",
  },
  {
    name: "Photo ID",
    required: false,
    when: "Only if the venue needs security badges",
    how: "Name and photo ID for each person working on site.",
  },
];
