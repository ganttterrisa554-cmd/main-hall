import type { MetadataRoute } from "next";
import { company } from "@/data/company";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Main Hall — Corporate Event Planning",
    short_name: "Main Hall",
    description: company.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1eb",
    theme_color: "#12141a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
