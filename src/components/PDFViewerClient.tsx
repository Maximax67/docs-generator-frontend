'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { PDFViewer, Scale, Theme } from 'pdf-generator-api-pdfviewer';
import { useThemeMode } from '@/providers/AppThemeProvider';
import { ThemeMode } from '@/types/theme';

interface PdfViewerClientProps {
  blob?: Blob;
  url?: string;
  className?: string;
}

export const PdfViewerClient: FC<PdfViewerClientProps> = ({ blob, url, className }) => {
  const { mode } = useThemeMode();
  const [loadedTheme, setLoadedTheme] = useState<ThemeMode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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

    setTimeout(() => setLoadedTheme(mode), 0);
  }, [url, blob, mode, loadedTheme]);

  return <div ref={containerRef} className={className} />;
};
