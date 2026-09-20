import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MagangHub Bot Attendance",
  description: "Platform Manajemen Absensi & Laporan MagangHub Kemnaker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${inter.variable} ${inter.className} font-sans antialiased bg-canvas text-ink-primary min-h-screen`}
      >
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
