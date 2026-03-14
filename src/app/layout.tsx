import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LinQ",
  description: "LinQ ride sharing platform",
  manifest: "/manifest.json",
  themeColor: "#000000",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

/* 🔴 THIS FIXES ZOOMED-OUT MOBILE */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${sora.variable} antialiased overflow-x-hidden bg-white`}
      >
        <ServiceWorkerRegistration />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
