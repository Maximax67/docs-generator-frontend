'use client';

import { FC } from 'react';
import { Box, Paper, useTheme, useMediaQuery, Divider } from '@mui/material';
import { DocumentTree } from './DocumentTree';
import { PDFPreview } from './PDFPreview';
import { useDocumentStore } from '@/store/documents';

interface DocumentSelectorProps {
  showWebLink?: boolean;
}

export const DocumentSelector: FC<DocumentSelectorProps> = ({ showWebLink }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { selectedDocument, fetchPreview } = useDocumentStore();

  const handleRefreshPreview = () => {
    if (selectedDocument) {
      fetchPreview(selectedDocument.id);
    }
  };

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Paper elevation={1}>
          <DocumentTree />
        </Paper>

        <Paper elevation={1} sx={{ height: '80dvh' }}>
          <PDFPreview
            showWebLink={showWebLink}
            document={selectedDocument}
            onRefresh={handleRefreshPreview}
          />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 2 }}>
      <Paper elevation={1} sx={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column' }}>
        <DocumentTree />
      </Paper>

      <Divider orientation="vertical" flexItem />

      <Paper elevation={1} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <PDFPreview
            showWebLink={showWebLink}
            document={selectedDocument}
            onRefresh={handleRefreshPreview}
          />
        </Box>
      </Paper>
    </Box>
  );
};
