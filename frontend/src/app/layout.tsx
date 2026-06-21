import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campunity",
  description: "Share and discover educational notes and resources with fellow students",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Campunity", statusBarStyle: "default" },
  openGraph: {
    title: "Campunity",
    description: "Share and discover educational notes and resources with fellow students",
    type: "website",
    locale: "en_US",
    siteName: "Campunity",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campunity",
    description: "Share and discover educational notes and resources with fellow students",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{document.documentElement.classList.toggle('dark',localStorage.getItem('theme')==='dark'||(!localStorage.getItem('theme')&&window.matchMedia('(prefers-color-scheme:dark)').matches))}catch(e){}})()`}
        </Script>
      </head>
      <body className="bg-white dark:bg-dark-bg transition-colors duration-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
