import { ImageResponse } from "next/og";
import { events, getEventBySlug } from "@/data/events";

export const alt = "A Main Hall corporate event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#12141a",
          color: "#e8e4dc",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 34, letterSpacing: 10, fontWeight: 600 }}>MAIN HALL</div>
          <div style={{ fontSize: 24, color: "#c45c26", letterSpacing: 4 }}>
            {event ? `${event.type.toUpperCase()} · ${event.year}` : "EVENTS"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 120, height: 4, background: "#c45c26", marginBottom: 32 }} />
          <div style={{ fontSize: 68, lineHeight: 1.1, maxWidth: 1000 }}>
            {event ? event.title : "Corporate events across the USA"}
          </div>
          {event && (
            <div style={{ fontSize: 32, marginTop: 24, color: "rgba(232,228,220,0.75)" }}>
              {`${event.client} · ${event.venue}, ${event.city}, ${event.state}`}
            </div>
          )}
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "rgba(232,228,220,0.6)" }}>
          {event
            ? `${event.attendees.toLocaleString("en-US")} guests · ${event.days === 1 ? "1 day" : `${event.days} days`} · Planned by Main Hall`
            : "Planned by Main Hall"}
        </div>
      </div>
    ),
    size,
  );
}
