import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import {
  defaultDescription,
  defaultSiteName,
  defaultTitle,
  getAbsoluteUrl,
  getSiteUrl,
} from "@/lib/seo";

const font = Nunito({ subsets: ["latin"] });
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl ?? undefined,
  title: {
    default: defaultTitle,
    template: `%s | ${defaultSiteName}`,
  },
  description: defaultDescription,
  applicationName: defaultSiteName,
  keywords: [
    "Puolingo",
    "learn Setswana",
    "Setswana lessons",
    "Botswana language learning",
    "Setswana games",
    "speak Setswana",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: defaultSiteName,
    title: defaultTitle,
    description: defaultDescription,
    locale: "en_BW",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Puolingo preview for learning Setswana online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
  category: "education",
};

import { ExitModal } from "@/components/modals/exit-modal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: defaultSiteName,
    url: getAbsoluteUrl("/"),
    description: defaultDescription,
    inLanguage: ["en", "tn"],
    publisher: {
      "@type": "Organization",
      name: defaultSiteName,
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/zebra_logo.png"),
      },
    },
  };

  return (
    <html lang="en">
      <body className={font.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Toaster position="top-center" richColors />
        <ExitModal />
        {children}
      </body>
    </html>
  );
}
