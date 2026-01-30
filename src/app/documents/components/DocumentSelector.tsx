'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import { Box, Paper, useTheme, useMediaQuery, Divider } from '@mui/material';
import { DocumentTree } from './DocumentTree';
import { PdfPreview } from './PdfPreview';
import { VariableSchemaEditor } from './VariableSchemaEditor';
import { DriveFile, FolderTree, DocumentPreview } from '@/types/documents';
import { documentsApi } from '@/lib/api';
import { PreviewCache } from '@/lib/cache/preview-cache';
import { toErrorMessage } from '@/utils/errors-messages';

interface DocumentSelectorProps {
  showWebLink?: boolean;
}

const previewCache = new PreviewCache();

export const DocumentSelector: FC<DocumentSelectorProps> = ({ showWebLink }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Local state instead of global store
  const [folderTree, setFolderTree] = useState<FolderTree[] | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DriveFile | null>(null);
  const [previews, setPreviews] = useState<Record<string, DocumentPreview>>({});

  // Settings editor state
  const [variableSettings, setVariableSettings] = useState<string | null | undefined>(undefined);
  const [variableSettingsName, setVariableSettingsName] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load folder tree on mount
  useEffect(() => {
    const loadFolderTree = async () => {
      setTreeLoading(true);
      setTreeError(null);

      try {
        const data = await documentsApi.getFolderTree();
        setFolderTree(data.tree);
      } catch (error) {
        setTreeError(toErrorMessage(error, 'Не вдалося завантажити структуру папок'));
      } finally {
        setTreeLoading(false);
      }
    };

    loadFolderTree();
  }, []);

  // Preview fetch function
  const fetchPreview = useCallback(async (documentId: string) => {
    // Skip if already loading
    const current = previewCache.get(documentId);
    if (current?.loading) {
      return;
    }

    // Use cached version if valid
    if (previewCache.has(documentId)) {
      return;
    }

    // Set loading state
    const loadingPreview = previewCache.createLoadingPreview(documentId);
    previewCache.set(documentId, loadingPreview);
    setPreviews(previewCache.toRecord());

    try {
      const blob = await documentsApi.getDocumentPreview(documentId);

      // Convert blob to data URL for display
      await convertBlobToDataUrl(blob, (dataUrl) => {
        const successPreview = previewCache.createSuccessPreview(documentId, dataUrl, blob);
        previewCache.set(documentId, successPreview);
        setPreviews(previewCache.toRecord());
      });
    } catch (error) {
      const errorPreview = previewCache.createErrorPreview(
        documentId,
        toErrorMessage(error, 'Не вдалося завантажити попередній перегляд'),
      );
      previewCache.set(documentId, errorPreview);
      setPreviews(previewCache.toRecord());
    }
  }, []);

  // Handle document selection
  const handleDocumentSelect = useCallback(
    (document: DriveFile) => {
      if (hasUnsavedChanges && variableSettings !== undefined) {
        const confirmLeave = window.confirm(
          'У вас є незбережені зміни. Ви впевнені, що хочете вийти без збереження?',
        );
        if (!confirmLeave) {
          return;
        }
      }

      setSelectedDocument(document);
      setVariableSettings(undefined);
      setVariableSettingsName(null);
      setHasUnsavedChanges(false);

      // Auto-fetch preview if not cached
      if (!previewCache.has(document.id)) {
        fetchPreview(document.id);
      }
    },
    [hasUnsavedChanges, variableSettings, fetchPreview],
  );

  const handleRefreshPreview = useCallback(() => {
    if (selectedDocument) {
      fetchPreview(selectedDocument.id);
    }
  }, [selectedDocument, fetchPreview]);

  const handleSettingsOpen = useCallback(
    (id: string, name: string) => {
      if (hasUnsavedChanges && variableSettings !== undefined) {
        const confirmLeave = window.confirm(
          'У вас є незбережені зміни. Ви впевнені, що хочете вийти без збереження?',
        );
        if (!confirmLeave) {
          return;
        }
      }

      setVariableSettings(id);
      setVariableSettingsName(name);
      setHasUnsavedChanges(false);
    },
    [hasUnsavedChanges, variableSettings],
  );

  const handleSettingsClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'У вас є незбережені зміни. Ви впевнені, що хочете вийти без збереження?',
      );
      if (!confirmLeave) {
        return;
      }
    }

    setVariableSettings(undefined);
    setVariableSettingsName(null);
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges]);

  const handleSchemaChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const handleSchemaSave = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  const preview = selectedDocument ? previews[selectedDocument.id] : null;

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Paper elevation={1}>
          <DocumentTree
            folderTree={folderTree}
            treeLoading={treeLoading}
            treeError={treeError}
            selectedDocument={selectedDocument}
            onDocumentSelect={handleDocumentSelect}
            onSettingsOpen={handleSettingsOpen}
            onRetry={() => window.location.reload()}
          />
        </Paper>

        <Paper elevation={1} sx={{ height: '80dvh' }}>
          {typeof variableSettings === 'undefined' ? (
            <PdfPreview
              showWebLink={showWebLink}
              document={selectedDocument}
              preview={preview}
              onRefresh={handleRefreshPreview}
            />
          ) : (
            <VariableSchemaEditor
              scope={variableSettings}
              scopeName={variableSettingsName!}
              onClose={handleSettingsClose}
              onSave={handleSchemaSave}
              onChange={handleSchemaChange}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 2 }}>
      <Paper elevation={1} sx={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column' }}>
        <DocumentTree
          folderTree={folderTree}
          treeLoading={treeLoading}
          treeError={treeError}
          selectedDocument={selectedDocument}
          onDocumentSelect={handleDocumentSelect}
          onSettingsOpen={handleSettingsOpen}
          onRetry={() => window.location.reload()}
        />
      </Paper>

      <Divider orientation="vertical" flexItem />

      <Paper elevation={1} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {typeof variableSettings === 'undefined' ? (
            <PdfPreview
              showWebLink={showWebLink}
              document={selectedDocument}
              preview={preview}
              onRefresh={handleRefreshPreview}
            />
          ) : (
            <VariableSchemaEditor
              scope={variableSettings}
              scopeName={variableSettingsName!}
              onClose={handleSettingsClose}
              onSave={handleSchemaSave}
              onChange={handleSchemaChange}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

/**
 * Helper function to convert blob to data URL
 */
function convertBlobToDataUrl(blob: Blob, onSuccess: (dataUrl: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      onSuccess(dataUrl);
      resolve();
    };

    reader.onerror = () => {
      reject(new Error('Не вдалося обробити PDF файл'));
    };

    reader.readAsDataURL(blob);
  });
}
