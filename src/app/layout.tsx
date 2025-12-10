import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LinQ",
  
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${sora.variable} antialiased overflow-x-hidden`}>
        {children}
        <Analytics />

     
      
      </body>
    </html>
  );
}
