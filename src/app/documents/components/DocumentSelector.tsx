'use client';

import { FC, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Paper, Divider } from '@mui/material';
import { DocumentTree } from './DocumentTree';
import { PdfPreview } from './PdfPreview';
import { Settings, SettingsRef } from './Settings';
import { DriveFile, FolderTreeGlobal, FolderTree, DocumentPreview } from '@/types/documents';
import { documentsApi } from '@/lib/api';
import { PreviewCache } from '@/lib/cache/preview-cache';
import { toErrorMessage } from '@/utils/errors-messages';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useUserStore } from '@/store/user';
import { convertBlobToUrl } from '@/utils/convert-blob-to-url';
import { findInTree, getExpandPath, TreeNodePath } from '@/utils/document-tree';
import { isAdminUser } from '@/utils/is-admin';
import { useNotify } from '@/providers/NotificationProvider';

interface DocumentSelectorProps {
  showWebLink?: boolean;
}

type ViewMode = 'preview' | 'settings';

const previewCache = new PreviewCache();

export const DocumentSelector: FC<DocumentSelectorProps> = ({ showWebLink }) => {
  const notify = useNotify();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const isAdmin = isAdminUser(user);

  // Local state instead of global store
  const [folderTree, setFolderTree] = useState<FolderTreeGlobal | FolderTree | null>(null);
  const [scopeFolderId, setScopeFolderId] = useState<string | null>(null);
  const [scopeFolderName, setScopeFolderName] = useState<string | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DriveFile | null>(null);
  const [previews, setPreviews] = useState<Record<string, DocumentPreview>>({});
  const [expandedPaths, setExpandedPaths] = useState<Set<TreeNodePath>>(new Set());
  const [highlightPath, setHighlightPath] = useState<TreeNodePath | null>(null);
  const isInitFromUrlParamsDoneRef = useRef(false);

  // Settings editor state
  const [variableSettings, setVariableSettings] = useState<string | null | undefined>(undefined);
  const [variableSettingsName, setVariableSettingsName] = useState<string | null>(null);
  const [variableSettingsIsFolder, setVariableSettingsIsFolder] = useState<boolean>(false);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const editorRef = useRef<SettingsRef>(null);

  const scope = searchParams.get('scope');
  const pathParam = searchParams.get('path');
  const mode = searchParams.get('mode') as ViewMode | null;
  const treeScopeParam = searchParams.get('treeScope');

  const loadFolderTree = useCallback(async (folderId: string | null) => {
    setTreeLoading(true);
    setTreeError(null);

    try {
      if (folderId) {
        setScopeFolderId(folderId);
        const data = await documentsApi.getFolderTree(folderId);
        setFolderTree(data);
        setScopeFolderName(data.current_folder.name);
      } else {
        setScopeFolderId(null);
        setScopeFolderName(null);
        const data = await documentsApi.getGlobalFolderTree();
        setFolderTree(data);
      }
    } catch (error) {
      setTreeError(toErrorMessage(error, 'Не вдалося завантажити структуру папок'));
    } finally {
      setTreeLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolderTree(treeScopeParam);
  }, [loadFolderTree, treeScopeParam]);

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

    if (
      'current_folder' in folderTree &&
      folderTree.current_folder &&
      scope === folderTree.current_folder.id
    ) {
      return;
    }

    const result = findInTree(folderTree, scope);
    if (!result) {
      notify('Документ або папку не знайдено', 'error');
      return;
    }

    if (mode === 'settings' && !isAdmin) {
      notify(user ? 'Доступ заборонено' : 'Увійдіть для доступу до налаштувань', 'warning');
      return;
    }

    // Use path parameter if provided, otherwise get first path
    const pathsToExpand = getExpandPath(folderTree, scope);
    if (pathsToExpand && pathsToExpand.length > 0) {
      const targetPath = pathParam || pathsToExpand[0];

      // Expand all parent folders in the path
      const pathParts = targetPath.split('/').filter(Boolean);
      const pathsSet = new Set<TreeNodePath>();
      let currentPath = '';

      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        pathsSet.add(currentPath);
      }

      setExpandedPaths(pathsSet);
      setHighlightPath(targetPath);
    }

    if (mode === 'settings') {
      const name =
        result.type === 'document'
          ? result.item.name
          : result.type === 'folder'
            ? result.item.current_folder.name
            : '';
      const isFolder = result.type === 'folder';

      setVariableSettings(scope);
      setVariableSettingsName(name);
      setVariableSettingsIsFolder(isFolder);
      setSelectedDocument(null);
    } else if (result.type === 'document') {
      setSelectedDocument(result.item);
      setVariableSettings(undefined);
      setVariableSettingsName(null);
      setVariableSettingsIsFolder(false);

      if (!previewCache.has(result.item.id)) {
        fetchPreview(result.item.id);
      } else {
        const cachedPreview = previewCache.get(result.item.id);
        if (cachedPreview) {
          setPreviews((prev) => ({ ...prev, [result.item.id]: cachedPreview }));
        }
      }
    }
  }, [folderTree, scope, pathParam, mode, isAdmin, user, fetchPreview, notify]);

  const updateUrl = useCallback(
    (
      newScope: string | null,
      newPath: TreeNodePath | null,
      newMode: ViewMode | null,
      newTreeScope?: string | null,
    ) => {
      const params = new URLSearchParams();
      if (newScope) params.set('scope', newScope);
      if (newPath) params.set('path', newPath);
      if (newMode) params.set('mode', newMode);
      if (newTreeScope !== undefined) {
        if (newTreeScope) {
          params.set('treeScope', newTreeScope);
        }
      } else if (treeScopeParam) {
        params.set('treeScope', treeScopeParam);
      }

      const newUrl = params.toString() ? `?${params.toString()}` : '/documents';
      router.push(newUrl, { scroll: false });
    },
    [router, treeScopeParam],
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
    (document: DriveFile, path: TreeNodePath) => {
      const selectDocument = () => {
        setSelectedDocument(document);
        setVariableSettings(undefined);
        setVariableSettingsName(null);
        setVariableSettingsIsFolder(false);
        setHighlightPath(path);
        updateUrl(document.id, path, 'preview');

        if (!previewCache.has(document.id)) {
          fetchPreview(document.id);
        } else {
          const cachedPreview = previewCache.get(document.id);
          if (cachedPreview) {
            setPreviews((prev) => ({ ...prev, [document.id]: cachedPreview }));
          }
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
    (id: string, name: string, path: TreeNodePath, isFolder: boolean) => {
      const openSettings = () => {
        // Handle global scope settings
        const actualId = id === '__global__' ? null : id;

        setVariableSettings(actualId);
        setVariableSettingsName(name);
        setVariableSettingsIsFolder(isFolder);
        setSelectedDocument(null);
        setHighlightPath(path);
        updateUrl(actualId, path, 'settings');
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
      setVariableSettingsIsFolder(false);
      setHighlightPath(null);
      updateUrl(null, null, null);
    };

    if (editorRef.current?.hasUnsavedChanges) {
      confirmWithUnsavedChanges(closeSettings);
    } else {
      closeSettings();
    }
  }, [confirmWithUnsavedChanges, updateUrl]);

  const handlePathToggle = useCallback((path: TreeNodePath, isExpanded: boolean) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(path);
      } else {
        next.delete(path);
      }
      return next;
    });
  }, []);

  const handleScopeChange = useCallback(
    (folderId: string | null) => {
      const changeScopeAction = () => {
        // Clear selection when changing scope
        setSelectedDocument(null);
        setVariableSettings(undefined);
        setVariableSettingsName(null);
        setVariableSettingsIsFolder(false);
        setHighlightPath(null);
        setExpandedPaths(new Set());

        // Update URL with new tree scope
        updateUrl(null, null, null, folderId);
      };

      if (editorRef.current?.hasUnsavedChanges && variableSettings !== undefined) {
        confirmWithUnsavedChanges(changeScopeAction);
      } else {
        changeScopeAction();
      }
    },
    [variableSettings, confirmWithUnsavedChanges, updateUrl],
  );

  const handleRetryTree = useCallback(() => {
    loadFolderTree(treeScopeParam);
  }, [loadFolderTree, treeScopeParam]);

  const preview = selectedDocument ? previews[selectedDocument.id] : null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1, md: 2 },
        height: '100%',
        mb: { xs: 2, md: 0 },
      }}
    >
      <Paper
        elevation={1}
        sx={{
          flex: { xs: '0 0 auto', md: '0 0 400px' },
          display: 'flex',
          flexDirection: 'column',
          height: { xs: 'auto', md: '100%' },
        }}
      >
        <DocumentTree
          folderTree={folderTree}
          treeLoading={treeLoading}
          treeError={treeError}
          scopeFolderId={scopeFolderId}
          scopeFolderName={scopeFolderName}
          highlightPath={highlightPath}
          expandedPaths={expandedPaths}
          onDocumentSelect={handleDocumentSelect}
          onSettingsOpen={handleSettingsOpen}
          onPathToggle={handlePathToggle}
          onScopeChange={handleScopeChange}
          onRetry={handleRetryTree}
        />
      </Paper>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

      <Paper
        elevation={1}
        sx={{
          flex: { xs: '0 0 auto', md: '1 1 auto' },
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: '80dvh', md: 'auto' },
        }}
      >
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {typeof variableSettings === 'undefined' ? (
            <PdfPreview
              showWebLink={showWebLink}
              document={selectedDocument}
              preview={preview}
              onRefresh={handleRefreshPreview}
            />
          ) : (
            <Settings
              ref={editorRef}
              scope={variableSettings}
              scopeName={variableSettingsName!}
              isFolder={variableSettingsIsFolder}
              folderTree={folderTree}
              onClose={handleSettingsClose}
            />
          )}
        </Box>
      </Paper>

      <ConfirmDialog
        open={showConfirmDialog}
        title="Незбережені зміни"
        message="У вас є незбережені зміни. Ви впевнені, що хочете вийти без збереження?"
        confirmText="Війти без збереження"
        cancelText="Скасувати"
        onConfirm={handleConfirmProceed}
        onCancel={handleConfirmCancel}
        severity="warning"
      />
    </Box>
  );
};
