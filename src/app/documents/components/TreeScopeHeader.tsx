import { FC, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { FolderInputDialog } from './FolderInputDialog';
import { TreeNodePath } from '@/utils/document-tree';

interface TreeScopeHeaderProps {
  scopeFolderId: string | null;
  scopeFolderName: string | null;
  isAdmin: boolean;
  onScopeChange: (folderId: string | null) => void;
  onSettingsOpen?: (id: string, name: string, path: TreeNodePath, isFolder: boolean) => void;
}

export const TreeScopeHeader: FC<TreeScopeHeaderProps> = ({
  scopeFolderId,
  scopeFolderName,
  isAdmin,
  onScopeChange,
  onSettingsOpen,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

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
    const name = scopeFolderId ? scopeFolderName || 'Папка' : 'Глобальна область';
    const id = scopeFolderId || '__global__';
    onSettingsOpen?.(id, name, id, true);
  };

  const isGlobalScope = !scopeFolderId;

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
        {isGlobalScope ? (
          <>
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                textAlign: 'center',
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              Глобальна область
            </Typography>
            <IconButton size="small" onClick={handleOpenDialog}>
              <FolderOpenIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton size="small" onClick={handleReturnToGlobal}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {scopeFolderName || 'Папка'}
            </Typography>
            <IconButton size="small" onClick={handleOpenDialog}>
              <FolderOpenIcon fontSize="small" />
            </IconButton>
          </>
        )}

        {isAdmin && (
          <IconButton size="small" onClick={handleSettingsClick}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <FolderInputDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleFolderSubmit}
      />
    </>
  );
};
