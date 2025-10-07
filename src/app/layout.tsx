import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import RegisterSW from '../components/RegisterSW';
import AppThemeProvider from './providers';
import EmotionCacheProvider from './emotion';
import Header from '@/components/Header';
import RateLimitOverlay from '../components/RateLimitOverlay';

import './globals.css';
import PWAInstallPrompt from '@/components/PWSInstallPrompt';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Docs Generator',
  description: 'KPI docs generator app',
  manifest: '/site.manifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Docs Generator" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <EmotionCacheProvider>
          <AppThemeProvider>
            <RegisterSW />
            <PWAInstallPrompt />
            <Header />
            {children}
            <RateLimitOverlay />
          </AppThemeProvider>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}
