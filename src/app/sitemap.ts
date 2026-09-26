import type { MetadataRoute } from "next";
import { company } from "@/data/company";
import { events } from "@/data/events";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${company.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${company.url}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...events.map((event) => ({
      url: `${company.url}/events/${event.slug}`,
      lastModified: new Date(`${event.date}T12:00:00`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
