import { FC, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { FolderInputDialog } from './FolderInputDialog';
import { TreeNodePath } from '@/utils/document-tree';
import { useDictionary } from '@/contexts/LangContext';

interface TreeScopeHeaderProps {
  scopeFolderId: string | null;
  scopeFolderName: string | null;
  treeLoading: boolean;
  treeError: string | null;
  isAdmin: boolean;
  onScopeChange: (folderId: string | null) => void;
  onSettingsOpen?: (id: string, name: string, path: TreeNodePath, isFolder: boolean) => void;
}

export const TreeScopeHeader: FC<TreeScopeHeaderProps> = ({
  scopeFolderId,
  scopeFolderName,
  treeLoading,
  treeError,
  isAdmin,
  onScopeChange,
  onSettingsOpen,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dict = useDictionary();
  const d = dict.documents;

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFolderSubmit = (folderId: string) => {
    onScopeChange(folderId);
  };

  const handleReturnToGlobal = () => {
    onScopeChange(null);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = scopeFolderId ? scopeFolderName || d.folder : dict.scope.global;
    const id = scopeFolderId || '__global__';
    onSettingsOpen?.(id, name, id, true);
  };

  const isGlobalScope = !scopeFolderId;

  const getDisplayContent = () => {
    if (treeLoading && scopeFolderId) {
      return {
        text: d.loadingScope,
        icon: null,
        color: 'text.secondary',
      };
    }

    if (treeError && scopeFolderId) {
      return {
        text: d.loadScopeError,
        icon: <ErrorIcon fontSize="small" color="error" />,
        color: 'error.main',
      };
    }

    if (isGlobalScope) {
      return {
        text: dict.scope.global,
        icon: null,
        color: 'text.secondary',
      };
    }

    return {
      text: scopeFolderName || d.folder,
      icon: null,
      color: 'text.primary',
    };
  };

  const displayContent = getDisplayContent();

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 56,
        }}
      >
        {scopeFolderId && (
          <IconButton size="small" onClick={handleReturnToGlobal}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
          }}
        >
          {displayContent.icon}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: displayContent.color,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'left',
              flex: 1,
            }}
          >
            {displayContent.text}
          </Typography>
        </Box>

        {isAdmin && (
          <IconButton
            size="small"
            onClick={handleSettingsClick}
            disabled={treeLoading && !!scopeFolderId}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        )}

        <IconButton size="small" onClick={handleOpenDialog}>
          <FolderOpenIcon fontSize="small" />
        </IconButton>
      </Box>

      <FolderInputDialog
        open={dialogOpen}
        isAdmin={isAdmin}
        onClose={handleCloseDialog}
        onSubmit={handleFolderSubmit}
      />
    </>
  );
};
