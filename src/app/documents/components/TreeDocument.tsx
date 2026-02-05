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

interface TreeDocumentProps {
  document: DriveFile;
  highlight?: boolean;
  showSettings?: boolean;
  level?: number;
  onDocumentSelect: (document: DriveFile) => void;
  onSettingsOpen?: (id: string, name: string) => void;
}

export const TreeDocument: FC<TreeDocumentProps> = ({
  document,
  highlight,
  level = 0,
  showSettings = false,
  onDocumentSelect,
  onSettingsOpen,
}) => {
  const handleDocumentClick = (document: DriveFile) => {
    onDocumentSelect(document);
  };

  const handleOpenSchemaEditor = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    onSettingsOpen?.(id, name);
  };

  const fileName = formatFilename(document.name, document.mime_type);

  return (
    <ListItem key={document.id} disablePadding sx={{ pl: (level + 1) * 2 }}>
      <ListItemButton
        onClick={() => handleDocumentClick(document)}
        selected={highlight}
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
              <Typography variant="body2">{fileName}</Typography>
              {showSettings && (
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenSchemaEditor(e, document.id, fileName)}
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
