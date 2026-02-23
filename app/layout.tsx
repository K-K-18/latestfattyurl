import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CommandMenu } from "@/components/command-menu"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "FattyURL - Free URL Shortener | No Ads, No Limits",
    template: "%s | FattyURL",
  },
  description:
    "Free forever URL shortener. No ads. No limits. No BS. Create short links, QR codes, and track analytics - all for free.",
  keywords: [
    "url shortener",
    "link shortener",
    "free url shortener",
    "short links",
    "qr code generator",
    "link analytics",
    "free link shortener",
    "enterprise url shortener",
  ],
  authors: [{ name: "FattyURL" }],
  openGraph: {
    title: "FattyURL - Free URL Shortener | No Ads, No Limits",
    description:
      "Free forever URL shortener. No ads. No limits. No BS. Create short links, QR codes, and track analytics.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "FattyURL",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FattyURL - Free URL Shortener",
    description:
      "Free forever URL shortener. No ads. No limits. No BS.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FattyURL",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://fattyurl.com",
    description: "Free forever URL shortener with analytics, QR codes, and API access.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <CommandMenu />
          </TooltipProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
