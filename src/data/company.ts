export const company = {
  name: "Main Hall Events",
  email: "hello@mainhallevents.com",
  phone: "(252) 203-3655",
  phoneHref: "tel:+12522033655",
  phoneE164: "+1-252-203-3655",
  site: "mainhallevents.com",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mainhallevents.com").replace(/\/$/, ""),
  tagline: "Company events, planned end to end.",
  description:
    "Main Hall plans and runs corporate events across the United States: conferences, product launches, offsites, and galas, from the first brief to the last guest out.",
};
