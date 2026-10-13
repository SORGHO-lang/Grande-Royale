import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Admin ISP SAHEL" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg">{children}</div>;
}
