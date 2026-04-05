import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrushGoals — Organizational Performance Management",
  description:
    "Align your people. Crush every goal. The lightweight goal management platform for organizations who want clarity and accountability without heavy software.",
  keywords: [
    "organization goals",
    "OKR",
    "goal tracking",
    "business alignment",
    "accountability",
  ],
};

import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { PaymentStatusHandler } from "@/components/PaymentStatusHandler";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GlobalCelebration } from "@/components/ui/GlobalCelebration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <PaymentStatusHandler />
        <GlobalCelebration />
        <ErrorBoundary>
          <main>{children}</main>
        </ErrorBoundary>
        <Toaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
