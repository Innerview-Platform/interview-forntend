import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="relative min-h-full overflow-x-hidden bg-background font-sans text-foreground">
        <PageBackdrop />
        {children}
      </body>
    </html>
  );
}
