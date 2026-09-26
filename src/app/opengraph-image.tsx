import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { company } from "@/data/company";

export const alt = "Main Hall — corporate event planning across the USA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const hero = await readFile(join(process.cwd(), "public/hero.jpg"));
  const heroSrc = `data:image/jpeg;base64,${hero.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        <img
          src={heroSrc}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage:
              "linear-gradient(90deg, rgba(18,20,26,0.94) 0%, rgba(18,20,26,0.72) 55%, rgba(18,20,26,0.3) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "72px 80px",
            width: "100%",
            color: "#e8e4dc",
          }}
        >
          <div style={{ fontSize: 88, letterSpacing: 18, fontWeight: 600 }}>MAIN HALL</div>
          <div style={{ width: 120, height: 4, background: "#c45c26", marginTop: 24 }} />
          <div style={{ fontSize: 50, marginTop: 36, maxWidth: 760, lineHeight: 1.15 }}>
            {company.tagline}
          </div>
          <div style={{ fontSize: 26, marginTop: 24, color: "rgba(232,228,220,0.75)" }}>
            Conferences · Launches · Offsites · Galas — across the USA
          </div>
        </div>
      </div>
    ),
    size,
  );
}
