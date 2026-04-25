'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale, locales, type Locale } from '@/i18n';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const preferred = navigator.languages ?? [navigator.language];
    const matched = preferred
      .map((l) => l.split('-')[0].toLowerCase())
      .find((l) => locales.includes(l as Locale)) as Locale | undefined;

    router.replace(`/${matched ?? defaultLocale}`);
  }, [router]);

  return null;
}
