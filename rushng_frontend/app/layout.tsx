import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";
import { NetworkStatus } from "@/components/shared/NetworkStatus";
import { GlobalLoadingOverlay } from "@/components/shared/GlobalLoadingOverlay";
// import { AuthDebug } from "@/components/debug/AuthDebug";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rush.ng"),
  title: {
    default: "RUSHNG - Nigeria's Premier Service Marketplace",
    template: "%s | RUSHNG",
  },
  description: "Connect with trusted service providers across Nigeria. Find plumbers, electricians, carpenters, and more.",
  keywords: ["service marketplace", "Nigeria", "plumbing", "electrical", "carpentry", "handyman", "logistics"],
  authors: [{ name: "RUSHNG" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RUSHNG",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "RUSHNG - Nigeria's Premier Service Marketplace",
    description: "Find trusted service providers near you",
    type: "website",
    locale: "en_NG",
    siteName: "RUSHNG",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RUSHNG - Service Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RUSHNG - Nigeria's Premier Service Marketplace",
    description: "Find trusted service providers near you",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RUSHNG" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="RUSHNG" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          <GlobalLoadingOverlay />
          <NetworkStatus />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <PWAInstallPrompt />
          <Toaster position="top-right" richColors closeButton />
        </Providers>
        {/*{process.env.NODE_ENV === 'development' && <AuthDebug />}*/}
      </body>
    </html>
  );
}