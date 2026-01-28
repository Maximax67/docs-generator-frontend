import { FC, useState } from 'react';
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
import { useDocumentStore } from '@/store/documents';
import { formatFilename } from '@/utils/format-filename';

interface FolderTreeItemProps {
  item: FolderTree;
  level?: number;
  showSettings?: boolean;
  onSettingsOpen?: (id: string, name: string) => void;
}

export const FolderTreeItem: FC<FolderTreeItemProps> = ({
  item,
  level = 0,
  showSettings = false,
  onSettingsOpen,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { selectedDocument, selectDocument } = useDocumentStore();

  const handleDocumentClick = (document: DriveFile) => {
    selectDocument(document);
  };

  const handleFolderToggle = () => {
    setExpanded(!expanded);
  };

  const handleOpenSchemaEditor = (e: React.MouseEvent, id: string, name: string) => {
    onSettingsOpen?.(id, name);
    e.stopPropagation();
  };

  const hasChildren = item.folders.length > 0 || item.documents.length > 0;

  return (
    <>
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
                {showSettings && (
                  <IconButton
                    size="small"
                    onClick={(e) =>
                      handleOpenSchemaEditor(e, item.current_folder.id, item.current_folder.name)
                    }
                    sx={{ ml: 'auto' }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                )}
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
                level={level + 1}
                showSettings={showSettings}
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
                        {showSettings && (
                          <IconButton
                            size="small"
                            onClick={(e) =>
                              handleOpenSchemaEditor(
                                e,
                                item.current_folder.id,
                                item.current_folder.name,
                              )
                            }
                            sx={{ ml: 'auto' }}
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
      </Box>
    </>
  );
};
