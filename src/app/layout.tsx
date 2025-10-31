import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Providers from "@/components/Providers";
import AuthWrapper from "@/components/AuthWrapper"; // Import AuthWrapper
import { NextIntlClientProvider } from 'next-intl';
import PreventBounce from "@/components/PreventBounce";
import MobileTabBar from "@/components/MobileTabBar";
import CookieBanner from "@/components/CookieBanner";
import AppFooter from "@/components/AppFooter";
import { BRAND_NAME, TAGLINE, SITE_URL } from "@/config/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: `${BRAND_NAME}｜${TAGLINE}`,
  keywords: ['漾飛特', 'YoungFit', '健身', '營養', '飲食記錄', '運動', '健康記錄', 'PWA'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  themeColor: '#FF9A3D',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: BRAND_NAME,
    startupImage: [
      {
        url: "/icons/icon-192x192.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
      }
    ]
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
    ],
    shortcut: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ]
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: BRAND_NAME,
    siteName: BRAND_NAME,
    description: `${BRAND_NAME}｜${TAGLINE}`,
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512 }],
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND_NAME,
    description: `${BRAND_NAME}｜${TAGLINE}`,
    images: ['/icons/icon-512x512.png'],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": BRAND_NAME,
    "apple-touch-icon": "/icons/apple-touch-icon.png",
    "msapplication-TileImage": "/icons/icon-144x144.png",
    "msapplication-TileColor": "#FF9A3D"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 靜態載入中文訊息
async function getMessages() {
  return (await import('../../messages/zh.json')).default;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider locale="zh" messages={messages}>
          <Providers>
            <Navigation />
            <main className="flex-1">
              <AuthWrapper>{children}</AuthWrapper>
            </main>
            <AppFooter />
            <MobileTabBar />
            <PWAInstallPrompt />
            <PreventBounce />
            <CookieBanner />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
