'use client';

import { useEffect } from 'react';

/**
 * Sets document.documentElement.lang on the client.
 * Needed because the root layout can't know the lang param
 * at the server level for static export builds.
 */
export default function LangHtmlEffect({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
