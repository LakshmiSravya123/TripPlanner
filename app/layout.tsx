import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/Toaster";
import "leaflet/dist/leaflet.css";
// Polyfill for react-three-fiber compatibility

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Trip Planner - Plan Your Perfect Journey",
  description: "Plan your perfect trip with AI-powered recommendations. Get flights, hotels, activities, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trip Planner",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

