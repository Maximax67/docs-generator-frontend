'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PDFViewerClient } from '@/components/PDFViewerClient';

export default function ResultPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const storedUrl = sessionStorage.getItem('generatedPdfUrl');
    if (storedUrl) {
      setPdfUrl(storedUrl);
    }
  }, []);

  if (!pdfUrl) {
    return (
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body1">PDF не знайдено</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PDFViewerClient url={pdfUrl} className="h-full" />
    </Box>
  );
}
