import { FC } from 'react';
import {
  Box,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Description as FileIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { DriveFile } from '@/types/documents';
import { formatFilename } from '@/utils/format-filename';
import { TreeNodePath } from '@/utils/document-tree';

interface TreeDocumentProps {
  document: DriveFile;
  path: TreeNodePath;
  highlight?: boolean;
  showSettings?: boolean;
  level: number;
  onDocumentSelect: (document: DriveFile, path: TreeNodePath) => void;
  onSettingsOpen?: (id: string, name: string, path: TreeNodePath) => void;
}

export const TreeDocument: FC<TreeDocumentProps> = ({
  document,
  path,
  highlight,
  level,
  showSettings = false,
  onDocumentSelect,
  onSettingsOpen,
}) => {
  const handleDocumentClick = () => {
    onDocumentSelect(document, path);
  };

  const handleOpenSchemaEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileName = formatFilename(document.name, document.mime_type);
    onSettingsOpen?.(document.id, fileName, path);
  };

  const fileName = formatFilename(document.name, document.mime_type);

  return (
    <ListItem disablePadding sx={{ pl: level * 2 }}>
      <ListItemButton
        onClick={handleDocumentClick}
        selected={highlight}
        sx={{
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <FileIcon color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{fileName}</Typography>
              {showSettings && (
                <IconButton
                  size="small"
                  onClick={handleOpenSchemaEditor}
                  sx={{
                    ml: 'auto',
                    '&.MuiIconButton-root': {
                      padding: '4px',
                    },
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};
