import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraAi — Calm space for your mind",
  description: "A calm, supportive space for everyday emotional well-being—not a substitute for professional care.",
  applicationName: "AuraAi",
  appleWebApp: {
    capable: true,
    title: "AuraAi",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  // Icons are auto-discovered from app/favicon.ico, app/icon.svg, and
  // app/apple-icon.png via Next.js's file-based metadata convention.
  // SVG is preferred by modern browsers; favicon.ico is the fallback.
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#0d9488" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full min-h-dvh antialiased`}
    >
      <body className="flex min-h-dvh flex-col font-sans text-stone-900 selection:bg-teal-200/60 selection:text-teal-950 dark:text-stone-100 dark:selection:bg-teal-900/50 dark:selection:text-teal-50">
        {children}
      </body>
    </html>
  );
}
