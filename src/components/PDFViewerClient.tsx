'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { PDFViewer, Scale, Theme } from 'pdf-generator-api-pdfviewer';
import { useThemeMode } from '@/app/providers';
import { ThemeMode } from '@/types/theme';

interface PDFViewerClientProps {
  blob?: Blob;
  url?: string;
  className?: string;
}

export const PDFViewerClient: FC<PDFViewerClientProps> = ({ blob, url, className }) => {
  const { mode } = useThemeMode();
  const [loadedTheme, setLoadedTheme] = useState<ThemeMode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || loadedTheme) return;

    containerRef.current.innerHTML = '';

    const viewer = new PDFViewer({
      container: containerRef.current,
      options: {
        theme: mode === 'light' ? Theme.Light : Theme.Dark,
        initialScale: Scale.PageFit,
        toolbarFontSize: 16,
        toolbarIconSize: 24,
        scaleDropdown: true,
        search: true,
        signature: true,
        print: true,
        download: true,
        upload: false,
      },
    });

    if (blob) {
      const url = URL.createObjectURL(blob);
      viewer.loadUrl(url);
    } else if (url) {
      viewer.loadUrl(url);
    }

    setLoadedTheme(mode);
  }, [url, blob, mode, loadedTheme]);

  if (loadedTheme && loadedTheme !== mode) {
    setLoadedTheme(null);
  }

  return <div ref={containerRef} className={className} />;
};
