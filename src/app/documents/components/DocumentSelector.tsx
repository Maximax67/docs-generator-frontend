'use client';

import { FC, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Paper, useTheme, useMediaQuery, Divider } from '@mui/material';
import { DocumentTree } from './DocumentTree';
import { PdfPreview } from './PdfPreview';
import { VariableSchemaEditor, VariableSchemaEditorRef } from './VariableSchemaEditor';
import { DriveFile, FolderTree, DocumentPreview } from '@/types/documents';
import { documentsApi } from '@/lib/api';
import { PreviewCache } from '@/lib/cache/preview-cache';
import { toErrorMessage } from '@/utils/errors-messages';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useUserStore } from '@/store/user';
import { convertBlobToUrl } from '@/utils/convert-blob-to-url';
import { findInTree, getExpandPath } from '@/utils/document-tree';
import { isAdminUser } from '@/utils/is-admin';
import { useNotify } from '@/providers/NotificationProvider';

interface DocumentSelectorProps {
  showWebLink?: boolean;
}

type ViewMode = 'preview' | 'settings';

const previewCache = new PreviewCache();

export const DocumentSelector: FC<DocumentSelectorProps> = ({ showWebLink }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const notify = useNotify();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const isAdmin = isAdminUser(user);

  // Local state instead of global store
  const [folderTree, setFolderTree] = useState<FolderTree[] | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DriveFile | null>(null);
  const [previews, setPreviews] = useState<Record<string, DocumentPreview>>({});
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const isInitFromUrlParamsDoneRef = useRef(false);

  // Settings editor state
  const [variableSettings, setVariableSettings] = useState<string | null | undefined>(undefined);
  const [variableSettingsName, setVariableSettingsName] = useState<string | null>(null);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const editorRef = useRef<VariableSchemaEditorRef>(null);

  const scope = searchParams.get('scope');
  const mode = searchParams.get('mode') as ViewMode | null;

  const loadFolderTree = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadFolderTree();
  }, [loadFolderTree]);

  const fetchPreview = useCallback(async (documentId: string) => {
    const current = previewCache.get(documentId);
    if (current?.loading) {
      return;
    }

    if (previewCache.has(documentId)) {
      return;
    }

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

  useEffect(() => {
    if (isInitFromUrlParamsDoneRef.current || !folderTree || !scope) return;

    isInitFromUrlParamsDoneRef.current = true;

    const result = findInTree(folderTree, scope);
    if (!result) {
      notify({
        message: 'Документ або папку не знайдено',
        severity: 'error',
      });
      return;
    }

    if (mode === 'settings' && !isAdmin) {
      notify({
        message: user ? 'Доступ заборонено' : 'Увійдіть для доступу до налаштувань',
        severity: 'warning',
      });
      return;
    }

    if (expandedFolders.size === 0) {
      const pathToExpand = getExpandPath(folderTree, scope);
      if (pathToExpand) {
        setExpandedFolders(new Set(pathToExpand));
      }
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
  }, [folderTree, scope, mode, isAdmin, user, fetchPreview, expandedFolders, notify]);

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
        updateUrl(document.id, 'preview');

        if (!previewCache.has(document.id)) {
          fetchPreview(document.id);
        }
      };

      if (editorRef.current?.hasUnsavedChanges && variableSettings !== undefined) {
        confirmWithUnsavedChanges(selectDocument);
      } else {
        selectDocument();
      }
    },
    [variableSettings, fetchPreview, confirmWithUnsavedChanges, updateUrl],
  );

  const handleRefreshPreview = useCallback(() => {
    if (selectedDocument) {
      fetchPreview(selectedDocument.id);
    }
  }, [selectedDocument, fetchPreview]);

  const handleSettingsOpen = useCallback(
    (id: string, name: string) => {
      const openSettings = () => {
        setVariableSettings(id);
        setVariableSettingsName(name);
        setSelectedDocument(null);
        updateUrl(id, 'settings');
      };

      if (editorRef.current?.hasUnsavedChanges && variableSettings !== undefined) {
        confirmWithUnsavedChanges(openSettings);
      } else {
        openSettings();
      }
    },
    [variableSettings, confirmWithUnsavedChanges, updateUrl],
  );

  const handleSettingsClose = useCallback(() => {
    const closeSettings = () => {
      setVariableSettings(undefined);
      setVariableSettingsName(null);
      updateUrl(null, null);
    };

    if (editorRef.current?.hasUnsavedChanges) {
      confirmWithUnsavedChanges(closeSettings);
    } else {
      closeSettings();
    }
  }, [confirmWithUnsavedChanges, updateUrl]);

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

  const mainContent = useMemo(() => {
    if (typeof variableSettings === 'undefined') {
      return (
        <PdfPreview
          showWebLink={showWebLink}
          document={selectedDocument}
          preview={preview}
          onRefresh={handleRefreshPreview}
        />
      );
    }

    return (
      <VariableSchemaEditor
        ref={editorRef}
        scope={variableSettings}
        scopeName={variableSettingsName!}
        onClose={handleSettingsClose}
      />
    );
  }, [
    variableSettings,
    showWebLink,
    selectedDocument,
    preview,
    handleRefreshPreview,
    variableSettingsName,
    handleSettingsClose,
  ]);

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Paper elevation={1}>
          <DocumentTree
            folderTree={folderTree}
            treeLoading={treeLoading}
            treeError={treeError}
            highlight={scope}
            expandedFolders={expandedFolders}
            onDocumentSelect={handleDocumentSelect}
            onSettingsOpen={handleSettingsOpen}
            onFolderToggle={handleFolderToggle}
            onRetry={loadFolderTree}
          />
        </Paper>
        <Paper elevation={1} sx={{ height: '80dvh' }}>
          {mainContent}
        </Paper>

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
          highlight={scope}
          expandedFolders={expandedFolders}
          onDocumentSelect={handleDocumentSelect}
          onSettingsOpen={handleSettingsOpen}
          onFolderToggle={handleFolderToggle}
          onRetry={loadFolderTree}
        />
      </Paper>
      <Divider orientation="vertical" flexItem />
      <Paper elevation={1} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>{mainContent}</Box>
      </Paper>

      <ConfirmDialog
        open={showConfirmDialog}
        title="Незбережені зміни"
        message="У вас є незбережені зміни. Ви впевнені, що хочете війти без збереження?"
        confirmText="Вийти без збереження"
        cancelText="Скасувати"
        onConfirm={handleConfirmProceed}
        onCancel={handleConfirmCancel}
        severity="warning"
      />
    </Box>
  );
};
