import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "../globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ProTech Roofing - Estimation Tool",
  description: "Professional roofing estimation tool for ProTech Roofing LLC.",
};

export const dynamic = "force-dynamic";

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-neutral-50">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary-50/30 to-transparent pointer-events-none" />
          <main className="relative">{children}</main>
        </div>
      </body>
    </html>
  );
}
