import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const primarySans = Roboto({
  variable: "--font-primary-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const primaryMono = Roboto_Mono({
  variable: "--font-primary-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Abbington Neighborhood Tool Share",
    template: "%s | Abbington Tool Share"
  },
  description:
    "Share tools with your neighbors in Abbington. Browse available tools, add your own, and build a stronger community by sharing resources.",
  metadataBase: new URL("https://abbington-tool-share.example.com"),
  keywords: ["tool sharing", "neighborhood", "Abbington", "community", "borrow tools"],
  authors: [{ name: "Abbington Community" }],
  openGraph: {
    title: "Abbington Neighborhood Tool Share",
    description: "Share tools with your neighbors in Abbington",
    type: "website",
    locale: "en_US",
  },
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
        className={`${primarySans.variable} ${primaryMono.variable} bg-background text-foreground`}
      >
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 md:py-12 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
