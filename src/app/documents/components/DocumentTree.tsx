'use client';

import { FC } from 'react';
import { Box, Typography, CircularProgress, Alert, List, Container, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useUserStore } from '@/store/user';
import { FolderTreeItem } from './FolderTreeItem';
import { DriveFile, FolderTree } from '@/types/documents';

interface DocumentTreeProps {
  folderTree: FolderTree[] | null;
  treeLoading: boolean;
  treeError: string | null;
  selectedDocument: DriveFile | null;
  onDocumentSelect: (document: DriveFile) => void;
  onSettingsOpen?: (id: string, name: string) => void;
  onRetry: () => void;
}

export const DocumentTree: FC<DocumentTreeProps> = ({
  folderTree,
  treeLoading,
  treeError,
  selectedDocument,
  onDocumentSelect,
  onSettingsOpen,
  onRetry,
}) => {
  const { user } = useUserStore();

  const isAdmin = user?.role === 'admin' || user?.role === 'god';

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

  if (!folderTree || folderTree.length === 0) {
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
        {folderTree.map((folder) => (
          <FolderTreeItem
            key={folder.current_folder.id}
            item={folder}
            selectedDocument={selectedDocument}
            showSettings={isAdmin}
            onDocumentSelect={onDocumentSelect}
            onSettingsOpen={onSettingsOpen}
          />
        ))}
      </List>
    </Box>
  );
};
