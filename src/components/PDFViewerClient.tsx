'use client';

import { FC, useEffect, useRef } from 'react';
import { PDFViewer, Scale, Theme } from 'pdf-generator-api-pdfviewer';
import { useThemeMode } from '@/app/providers';

interface PDFViewerClientProps {
  url: string;
  className?: string;
}

export const PDFViewerClient: FC<PDFViewerClientProps> = ({ url, className }) => {
  const { mode } = useThemeMode();
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

    viewer.loadUrl(url);
  }, [url, mode]);

  return <div ref={containerRef} className={className} />;
};
