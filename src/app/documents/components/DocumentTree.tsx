'use client';

import { FC, memo } from 'react';
import { Box, Typography, CircularProgress, Alert, List, Container, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useUserStore } from '@/store/user';
import { TreeFolder } from './TreeFolder';
import { DriveFile, FolderTreeGlobal } from '@/types/documents';
import { isAdminUser } from '@/utils/is-admin';
import { TreeDocument } from './TreeDocument';
import { TreeNodePath } from '@/utils/document-tree';

interface DocumentTreeProps {
  folderTree: FolderTreeGlobal | null;
  treeLoading: boolean;
  treeError: string | null;
  highlightPath?: TreeNodePath | null;
  expandedPaths: Set<TreeNodePath>;
  onDocumentSelect: (document: DriveFile, path: TreeNodePath) => void;
  onSettingsOpen?: (id: string, name: string, path: TreeNodePath) => void;
  onPathToggle: (path: TreeNodePath, isExpanded: boolean) => void;
  onRetry: () => void;
}

const DocumentTreeComponent: FC<DocumentTreeProps> = ({
  folderTree,
  treeLoading,
  treeError,
  highlightPath,
  expandedPaths,
  onDocumentSelect,
  onSettingsOpen,
  onPathToggle,
  onRetry,
}) => {
  const { user } = useUserStore();
  const isAdmin = isAdminUser(user);

  if (treeLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (treeError) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              <RefreshIcon sx={{ mr: 1 }} />
            </Button>
          }
        >
          {treeError}
        </Alert>
      </Container>
    );
  }

  if (!folderTree || (folderTree.documents.length === 0 && folderTree.folders.length === 0)) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Папки не знайдено
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <List>
        {folderTree.folders.map((folder) => (
          <TreeFolder
            key={folder.current_folder.id}
            folderTree={folder}
            parentPath=""
            highlightPath={highlightPath}
            expandedPaths={expandedPaths}
            showSettings={isAdmin}
            onDocumentSelect={onDocumentSelect}
            onSettingsOpen={onSettingsOpen}
            onPathToggle={onPathToggle}
          />
        ))}
        {folderTree.documents.map((document) => {
          const docPath = document.id; // Root level documents
          return (
            <TreeDocument
              key={`${docPath}`}
              document={document}
              path={docPath}
              highlight={docPath === highlightPath}
              showSettings={isAdmin}
              level={0}
              onDocumentSelect={onDocumentSelect}
              onSettingsOpen={onSettingsOpen}
            />
          );
        })}
      </List>
    </Box>
  );
};

export const DocumentTree = memo(DocumentTreeComponent);

DocumentTree.displayName = 'DocumentTree';
