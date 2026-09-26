export const metadata = {
  title: { default: "Partner portal", template: "%s — Main Hall Partners" },
  robots: { index: false, follow: false },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-mist">{children}</div>;
}
