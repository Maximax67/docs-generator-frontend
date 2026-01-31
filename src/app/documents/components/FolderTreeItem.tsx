import { FC } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Description as FileIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { DriveFile, FolderTree } from '@/types/documents';
import { formatFilename } from '@/utils/format-filename';

interface FolderTreeItemProps {
  item: FolderTree;
  highlight?: string | null;
  expandedFolders: Set<string>;
  level?: number;
  showSettings?: boolean;
  onDocumentSelect: (document: DriveFile) => void;
  onSettingsOpen?: (id: string, name: string) => void;
  onFolderToggle: (folderId: string, isExpanded: boolean) => void;
}

export const FolderTreeItem: FC<FolderTreeItemProps> = ({
  item,
  highlight,
  expandedFolders,
  level = 0,
  showSettings = false,
  onDocumentSelect,
  onSettingsOpen,
  onFolderToggle,
}) => {
  const isExpanded = expandedFolders.has(item.current_folder.id);

  const handleDocumentClick = (document: DriveFile) => {
    onDocumentSelect(document);
  };

  const handleFolderToggle = () => {
    onFolderToggle(item.current_folder.id, !isExpanded);
  };

  const handleOpenSchemaEditor = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    onSettingsOpen?.(id, name);
  };

  const hasChildren = item.folders.length > 0 || item.documents.length > 0;

  return (
    <>
      <ListItemButton
        onClick={handleFolderToggle}
        selected={highlight === item.current_folder.id}
        sx={{
          pl: level * 2 + 2,
          py: 0.5,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {isExpanded ? <FolderOpenIcon /> : <FolderIcon />}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.current_folder.name}
              </Typography>
              {showSettings && (
                <IconButton
                  size="small"
                  onClick={(e) =>
                    handleOpenSchemaEditor(e, item.current_folder.id, item.current_folder.name)
                  }
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
        {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.folders.map((subfolder) => (
            <FolderTreeItem
              key={subfolder.current_folder.id}
              item={subfolder}
              highlight={highlight}
              expandedFolders={expandedFolders}
              level={level + 1}
              showSettings={showSettings}
              onDocumentSelect={onDocumentSelect}
              onSettingsOpen={onSettingsOpen}
              onFolderToggle={onFolderToggle}
            />
          ))}

          {item.documents.map((document) => (
            <ListItem key={document.id} disablePadding sx={{ pl: (level + 1) * 2 }}>
              <ListItemButton
                onClick={() => handleDocumentClick(document)}
                selected={highlight === document.id}
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
                      {showSettings && (
                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleOpenSchemaEditor(
                              e,
                              document.id,
                              formatFilename(document.name, document.mime_type),
                            )
                          }
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
          ))}
        </List>
      </Collapse>
    </>
  );
};
