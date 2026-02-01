'use client';

import { FC, useEffect, useRef } from 'react';
import { PDFViewer, Scale, Theme } from 'pdf-generator-api-pdfviewer';
import { useThemeMode } from '@/providers/AppThemeProvider';

interface PdfViewerClientProps {
  blob?: Blob;
  url?: string;
  className?: string;
}

export const PdfViewerClient: FC<PdfViewerClientProps> = ({ blob, url, className }) => {
  const { mode } = useThemeMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PDFViewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    container.innerHTML = '';
    viewerRef.current = null;

    const viewer = new PDFViewer({
      container,
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

    viewerRef.current = viewer;

    let objectUrl: string | null = null;
    if (blob) {
      objectUrl = URL.createObjectURL(blob);
      viewer.loadUrl(objectUrl);
    } else if (url) {
      viewer.loadUrl(url);
    }

    return () => {
      container.innerHTML = '';
      viewerRef.current = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mode, blob, url]);

  return <div ref={containerRef} className={className} />;
};
