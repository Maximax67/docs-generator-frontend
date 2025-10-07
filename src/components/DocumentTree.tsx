'use client';

import { FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Container,
  Button,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Description as FileIcon,
  Refresh as RefreshIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { DriveFile, FolderTree } from '@/types/documents';
import { useDocumentStore } from '@/store/documents';
import { formatFilename } from '@/utils/format-filename';

interface DocumentTreeProps {
  onDocumentSelect?: (document: DriveFile) => void;
}

interface FolderTreeItemProps {
  item: FolderTree;
  onDocumentSelect?: (document: DriveFile) => void;
  level?: number;
}

const FolderTreeItem: FC<FolderTreeItemProps> = ({ item, onDocumentSelect, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const { selectedDocument, selectDocument } = useDocumentStore();

  const handleDocumentClick = (document: DriveFile) => {
    selectDocument(document);
    onDocumentSelect?.(document);
  };

  const handleFolderToggle = () => {
    setExpanded(!expanded);
  };

  const hasChildren = item.folders.length > 0 || item.documents.length > 0;

  return (
    <Box>
      <ListItemButton
        onClick={handleFolderToggle}
        sx={{
          pl: level * 2 + 2,
          py: 0.5,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {expanded ? <FolderOpenIcon /> : <FolderIcon />}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.current_folder.name}
              </Typography>
            </Box>
          }
        />
        {hasChildren && (expanded ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.folders.map((subfolder) => (
            <FolderTreeItem
              key={subfolder.current_folder.id}
              item={subfolder}
              onDocumentSelect={onDocumentSelect}
              level={level + 1}
            />
          ))}

          {item.documents.map((document) => (
            <ListItem key={document.id} disablePadding sx={{ pl: (level + 1) * 2 + 2 }}>
              <ListItemButton
                onClick={() => handleDocumentClick(document)}
                selected={selectedDocument?.id === document.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <FileIcon sx={{ color: 'primary.main', fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {formatFilename(document.name, document.mime_type)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
};

export const DocumentTree: FC<DocumentTreeProps> = ({ onDocumentSelect }) => {
  const { folderTree, treeLoading, treeError, fetchFolderTree, clearTreeError } =
    useDocumentStore();

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
            onDocumentSelect={onDocumentSelect}
          />
        ))}
      </List>
    </Box>
  );
};
