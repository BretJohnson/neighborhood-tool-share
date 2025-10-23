import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const primarySans = Inter({
  variable: "--font-primary-sans",
  subsets: ["latin"],
  display: "swap",
});

const primaryMono = Roboto_Mono({
  variable: "--font-primary-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abbington Neighborhood Tool Share",
  description:
    "Share, discover, and manage neighborhood tools with Supabase-powered authentication and storage.",
  metadataBase: new URL("https://abbington-tool-share.example.com"),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
      return (
        <html lang="en">
          <body
        className={`${primarySans.variable} ${primaryMono.variable} bg-background text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
