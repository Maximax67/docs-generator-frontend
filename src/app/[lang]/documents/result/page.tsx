'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Container } from '@mui/material';
import { PdfViewerClient } from '@/components/PdfViewerClient';
import { getPdfFromIndexedDb } from '@/lib/indexed-db-pdf';
import { useDictionary } from '@/contexts/LangContext';

export default function ResultPage() {
  const dict = useDictionary();
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPdf = async () => {
      try {
        const blob = await getPdfFromIndexedDb('generatedPdf');
        if (blob) {
          setPdfBlob(blob);
        }
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      getPdf();
    }
  }, [loading]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!pdfBlob) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{dict.documents.resultNotFound}</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        height: 'calc(100dvh - 64px)',
      }}
    >
      <PdfViewerClient blob={pdfBlob} sidebar className="h-full" />
    </Box>
  );
}
