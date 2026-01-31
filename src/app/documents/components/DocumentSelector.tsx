'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
  Snackbar,
  Alert,
  SxProps,
} from '@mui/material';
import { DocumentTree } from './DocumentTree';
import { PdfPreview } from './PdfPreview';
import { VariableSchemaEditor } from './VariableSchemaEditor';
import { DriveFile, FolderTree, DocumentPreview } from '@/types/documents';
import { documentsApi } from '@/lib/api';
import { PreviewCache } from '@/lib/cache/preview-cache';
import { toErrorMessage } from '@/utils/errors-messages';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useUserStore } from '@/store/user';
import { convertBlobToUrl } from '@/utils/convert-blob-to-url';
import { findInTree, getExpandPath } from '@/utils/document-tree';

interface DocumentSelectorProps {
  showWebLink?: boolean;
}

type ViewMode = 'preview' | 'settings';

const previewCache = new PreviewCache();

export const DocumentSelector: FC<DocumentSelectorProps> = ({ showWebLink }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();

  const isAdmin = user?.role === 'admin' || user?.role === 'god';

  // Local state instead of global store
  const [folderTree, setFolderTree] = useState<FolderTree[] | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DriveFile | null>(null);
  const [previews, setPreviews] = useState<Record<string, DocumentPreview>>({});
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Settings editor state
  const [variableSettings, setVariableSettings] = useState<string | null | undefined>(undefined);
  const [variableSettingsName, setVariableSettingsName] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'error' | 'warning' | 'info';
  } | null>(null);

  // URL params
  const scope = searchParams.get('scope');
  const mode = searchParams.get('mode') as ViewMode | null;

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
      await convertBlobToUrl(blob, (dataUrl) => {
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

  // Handle URL params once tree is loaded
  useEffect(() => {
    if (!folderTree || !scope) return;

    const result = findInTree(folderTree, scope);

    if (!result) {
      setNotification({
        message: 'Документ або папку не знайдено',
        severity: 'error',
      });
      return;
    }

    if (mode === 'settings' && !isAdmin) {
      setNotification({
        message: user ? 'Доступ заборонено' : 'Увійдіть для доступу до налаштувань',
        severity: 'warning',
      });
      return;
    }

    const pathToExpand = getExpandPath(folderTree, scope);
    if (pathToExpand) {
      setExpandedFolders(new Set(pathToExpand));
    }

    if (mode === 'settings') {
      const name =
        result.type === 'document'
          ? result.item.name
          : result.type === 'folder'
            ? result.item.current_folder.name
            : '';
      setVariableSettings(scope);
      setVariableSettingsName(name);
      setSelectedDocument(null);
    } else if (result.type === 'document') {
      setSelectedDocument(result.item);
      setVariableSettings(undefined);
      setVariableSettingsName(null);

      if (!previewCache.has(result.item.id)) {
        fetchPreview(result.item.id);
      }
    }
  }, [folderTree, scope, mode, isAdmin, user, fetchPreview]);

  const updateUrl = useCallback(
    (newScope: string | null, newMode: ViewMode | null) => {
      const params = new URLSearchParams();
      if (newScope) params.set('scope', newScope);
      if (newMode) params.set('mode', newMode);

      const newUrl = params.toString() ? `?${params.toString()}` : '/documents';
      router.push(newUrl, { scroll: false });
    },
    [router],
  );

  const confirmWithUnsavedChanges = useCallback((action: () => void) => {
    setPendingAction(() => action);
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmProceed = useCallback(() => {
    setShowConfirmDialog(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setHasUnsavedChanges(false);
  }, [pendingAction]);

  const handleConfirmCancel = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  }, []);

  const handleDocumentSelect = useCallback(
    (document: DriveFile) => {
      const selectDocument = () => {
        setSelectedDocument(document);
        setVariableSettings(undefined);
        setVariableSettingsName(null);
        setHasUnsavedChanges(false);
        updateUrl(document.id, 'preview');

        if (!previewCache.has(document.id)) {
          fetchPreview(document.id);
        }
      };

      if (hasUnsavedChanges && variableSettings !== undefined) {
        confirmWithUnsavedChanges(selectDocument);
      } else {
        selectDocument();
      }
    },
    [hasUnsavedChanges, variableSettings, fetchPreview, confirmWithUnsavedChanges, updateUrl],
  );

  const handleRefreshPreview = useCallback(() => {
    if (selectedDocument) {
      fetchPreview(selectedDocument.id);
    }
  }, [selectedDocument, fetchPreview]);

  const handleSettingsOpen = useCallback(
    (id: string, name: string) => {
      console.log(name);
      const openSettings = () => {
        setVariableSettings(id);
        setVariableSettingsName(name);
        setSelectedDocument(null);
        setHasUnsavedChanges(false);
        updateUrl(id, 'settings');
      };

      if (hasUnsavedChanges && variableSettings !== undefined) {
        confirmWithUnsavedChanges(openSettings);
      } else {
        openSettings();
      }
    },
    [hasUnsavedChanges, variableSettings, confirmWithUnsavedChanges, updateUrl],
  );

  const handleSettingsClose = useCallback(() => {
    const closeSettings = () => {
      setVariableSettings(undefined);
      setVariableSettingsName(null);
      setHasUnsavedChanges(false);
      updateUrl(null, null);
    };

    if (hasUnsavedChanges) {
      confirmWithUnsavedChanges(closeSettings);
    } else {
      closeSettings();
    }
  }, [hasUnsavedChanges, confirmWithUnsavedChanges, updateUrl]);

  const handleSchemaChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const handleSchemaSave = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  const handleFolderToggle = useCallback((folderId: string, isExpanded: boolean) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(folderId);
      } else {
        next.delete(folderId);
      }
      return next;
    });
  }, []);

  const preview = selectedDocument ? previews[selectedDocument.id] : null;

  const MainContent = () =>
    typeof variableSettings === 'undefined' ? (
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
    );

  const DocumentTreePanel = ({ sx }: { sx?: SxProps }) => (
    <Paper elevation={1} sx={sx}>
      <DocumentTree
        folderTree={folderTree}
        treeLoading={treeLoading}
        treeError={treeError}
        highlight={scope}
        expandedFolders={expandedFolders}
        onDocumentSelect={handleDocumentSelect}
        onSettingsOpen={handleSettingsOpen}
        onFolderToggle={handleFolderToggle}
        onRetry={() => window.location.reload()}
      />
    </Paper>
  );

  const GlobalOverlays = () => (
    <>
      <ConfirmDialog
        open={showConfirmDialog}
        title="Незбережені зміни"
        message="У вас є незбережені зміни. Ви впевнені, що хочете вийти без збереження?"
        confirmText="Вийти без збереження"
        cancelText="Скасувати"
        onConfirm={handleConfirmProceed}
        onCancel={handleConfirmCancel}
        severity="warning"
      />

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </>
  );

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <DocumentTreePanel />
        <Paper elevation={1} sx={{ height: '80dvh' }}>
          <MainContent />
        </Paper>
        <GlobalOverlays />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 2 }}>
      <DocumentTreePanel sx={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column' }} />
      <Divider orientation="vertical" flexItem />
      <Paper elevation={1} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <MainContent />
        </Box>
      </Paper>
      <GlobalOverlays />
    </Box>
  );
};
