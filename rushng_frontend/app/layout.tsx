import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "RUSHNG - Nigeria's Premier Service Marketplace",
    template: "%s | RUSHNG",
  },
  description: "Connect with trusted service providers across Nigeria. Find plumbers, electricians, carpenters, and more.",
  keywords: ["service marketplace", "Nigeria", "plumbing", "electrical", "carpentry", "handyman"],
  authors: [{ name: "RUSHNG" }],
  openGraph: {
    title: "RUSHNG - Nigeria's Premier Service Marketplace",
    description: "Find trusted service providers near you",
    type: "website",
    locale: "en_NG",
    siteName: "RUSHNG",
  },
  twitter: {
    card: "summary_large_image",
    title: "RUSHNG - Nigeria's Premier Service Marketplace",
    description: "Find trusted service providers near you",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Providers>
          {/* ✅ Navbar is now here - will show on all pages */}
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}