import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "ISP SAHEL — Institut Supérieur Privé du Sahel | Diplômes reconnus par l'État",
    template: "%s | ISP SAHEL",
  },
  description: SITE.presentation,
  applicationName: "ISP SAHEL",
  keywords: [
    "ISP SAHEL",
    "Institut Supérieur Privé du Sahel",
    "Ouagadougou",
    "Burkina Faso",
    "génie civil",
    "BTP",
    "topographie",
    "informatique",
    "réseaux et télécommunications",
    "Licence",
    "Master",
  ],
  openGraph: {
    type: "website",
    locale: "fr_BF",
    siteName: "ISP SAHEL",
    url: SITE.url,
  },
  twitter: { card: "summary_large_image" },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/actualites/rss.xml", title: "Actualités ISP SAHEL" }] },
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14409a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1330" },
  ],
};

const themeScript = `document.documentElement.classList.add("anim");try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
