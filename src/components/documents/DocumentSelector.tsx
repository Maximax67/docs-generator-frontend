'use client';

import { FC, useState } from 'react';
import { Box, Paper, useTheme, useMediaQuery, Divider } from '@mui/material';
import { DocumentTree } from './DocumentTree';
import { PDFPreview } from './PDFPreview';
import { useDocumentStore } from '@/store/documents';
import { VariableSchemaEditor } from './VariableSchemaEditor';

interface DocumentSelectorProps {
  showWebLink?: boolean;
}

export const DocumentSelector: FC<DocumentSelectorProps> = ({ showWebLink }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { selectedDocument, fetchPreview } = useDocumentStore();
  const [variableSettings, setVariableSettings] = useState<string | null | undefined>(undefined);
  const [variableSettingsName, setVariableSettingsName] = useState<string | null>(null);

  const handleRefreshPreview = () => {
    if (selectedDocument) {
      fetchPreview(selectedDocument.id);
    }
  };

  const handleSettingsOpen = (id: string, name: string) => {
    setVariableSettings(id);
    setVariableSettingsName(name);
  };

  const handleSettingsClose = () => {
    setVariableSettings(undefined);
    setVariableSettingsName(null);
  };

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Paper elevation={1}>
          <DocumentTree onSettingsOpen={handleSettingsOpen} />
        </Paper>

        <Paper elevation={1} sx={{ height: '80dvh' }}>
          {typeof variableSettings === 'undefined' ? (
            <PDFPreview
              showWebLink={showWebLink}
              document={selectedDocument}
              onRefresh={handleRefreshPreview}
            />
          ) : (
            <VariableSchemaEditor
              scope={variableSettings}
              scopeName={variableSettingsName!}
              onClose={handleSettingsClose}
            />
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 2 }}>
      <Paper elevation={1} sx={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column' }}>
        <DocumentTree onSettingsOpen={handleSettingsOpen} />
      </Paper>

      <Divider orientation="vertical" flexItem />

      <Paper elevation={1} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {typeof variableSettings === 'undefined' ? (
            <PDFPreview
              showWebLink={showWebLink}
              document={selectedDocument}
              onRefresh={handleRefreshPreview}
            />
          ) : (
            <VariableSchemaEditor
              scope={variableSettings}
              scopeName={variableSettingsName!}
              onClose={handleSettingsClose}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};
