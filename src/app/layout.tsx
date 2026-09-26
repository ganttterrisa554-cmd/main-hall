import type { Metadata, Viewport } from "next";
import { Sora, Syne } from "next/font/google";
import { company } from "@/data/company";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: {
    default: "Main Hall — Corporate Event Planning in the USA",
    template: "%s — Main Hall",
  },
  description: company.description,
  applicationName: "Main Hall",
  keywords: [
    "corporate event planning",
    "corporate event planner",
    "conference planning",
    "product launch events",
    "company offsites",
    "corporate galas",
    "event production USA",
  ],
  authors: [{ name: company.name, url: company.url }],
  creator: company.name,
  publisher: company.name,
  category: "Event planning",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Main Hall",
    title: "Main Hall — Corporate Event Planning in the USA",
    description: company.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Main Hall — Corporate Event Planning in the USA",
    description: company.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: true, email: true, address: false },
};

export const viewport: Viewport = {
  themeColor: "#12141a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${syne.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
