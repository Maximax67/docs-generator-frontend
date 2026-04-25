import type { Metadata } from 'next';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';
import Header from '@/components/Header';
import RateLimitOverlay from '@/components/RateLimitOverlay';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';
import UserProvider from '@/providers/UserProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { ConfirmProvider } from '@/providers/ConfirmProvider';
import { LangProvider } from '@/contexts/LangContext';
import { locales, getDictionary, type Locale } from '@/i18n';
import LangHtmlEffect from '@/components/LangHtmlEffect';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: LangLayoutProps): Promise<Metadata> {
  const { lang } = await params;
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? '';

  return {
    // hreflang alternate links for SEO
    alternates: {
      canonical: `${frontendUrl}/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `${frontendUrl}/${l}`])),
    },
  };
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : 'uk';
  getDictionary(locale);

  return (
    <LangProvider lang={locale}>
      <LangHtmlEffect lang={locale} />
      <UserProvider>
        <NotificationProvider>
          <ConfirmProvider>
            <RegisterServiceWorker />
            <PwaInstallPrompt />
            <Header />
            {children}
          </ConfirmProvider>
        </NotificationProvider>
        <RateLimitOverlay />
      </UserProvider>
    </LangProvider>
  );
}
