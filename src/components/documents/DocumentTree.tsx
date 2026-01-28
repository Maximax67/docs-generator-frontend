'use client';

import { FC, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  Container,
  Button,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useDocumentStore } from '@/store/documents';
import { useUserStore } from '@/store/user';
import { FolderTreeItem } from './FolderTreeItem';

interface DocumentTreeProps {
  onSettingsOpen?: (id: string, name: string) => void;
}

export const DocumentTree: FC<DocumentTreeProps> = ({ onSettingsOpen }) => {
  const { folderTree, treeLoading, treeError, fetchFolderTree, clearTreeError } =
    useDocumentStore();
  const { user } = useUserStore();

  const isAdmin = user?.role === 'admin' || user?.role === 'god';

  useEffect(() => {
    if (!folderTree && !treeLoading && !treeError) {
      fetchFolderTree();
    }
  }, [folderTree, treeLoading, treeError, fetchFolderTree]);

  if (treeError) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={clearTreeError}>
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
            showSettings={isAdmin}
            onSettingsOpen={onSettingsOpen}
          />
        ))}
      </List>
    </Box>
  );
};
