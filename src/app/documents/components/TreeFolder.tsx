import { FC } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { DriveFile, FolderTree } from '@/types/documents';
import { TreeDocument } from './TreeDocument';

interface TreeFolderProps {
  folderTree: FolderTree;
  highlight?: string | null;
  expandedFolders: Set<string>;
  level?: number;
  showSettings?: boolean;
  onDocumentSelect: (document: DriveFile) => void;
  onSettingsOpen?: (id: string, name: string) => void;
  onFolderToggle: (folderId: string, isExpanded: boolean) => void;
}

export const TreeFolder: FC<TreeFolderProps> = ({
  folderTree,
  highlight,
  expandedFolders,
  level = 0,
  showSettings = false,
  onDocumentSelect,
  onSettingsOpen,
  onFolderToggle,
}) => {
  const isExpanded = expandedFolders.has(folderTree.current_folder.id);

  const handleFolderToggle = () => {
    onFolderToggle(folderTree.current_folder.id, !isExpanded);
  };

  const handleOpenSchemaEditor = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    onSettingsOpen?.(id, name);
  };

  const hasChildren = folderTree.folders.length > 0 || folderTree.documents.length > 0;

  return (
    <>
      <ListItemButton
        onClick={handleFolderToggle}
        selected={highlight === folderTree.current_folder.id}
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
                {folderTree.current_folder.name}
              </Typography>
              {showSettings && (
                <IconButton
                  size="small"
                  onClick={(e) =>
                    handleOpenSchemaEditor(
                      e,
                      folderTree.current_folder.id,
                      folderTree.current_folder.name,
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
        {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {folderTree.folders.map((subfolder) => (
            <TreeFolder
              key={subfolder.current_folder.id}
              folderTree={subfolder}
              highlight={highlight}
              expandedFolders={expandedFolders}
              level={level + 1}
              showSettings={showSettings}
              onDocumentSelect={onDocumentSelect}
              onSettingsOpen={onSettingsOpen}
              onFolderToggle={onFolderToggle}
            />
          ))}

          {folderTree.documents.map((document) => (
            <TreeDocument
              key={document.id}
              document={document}
              highlight={document.id === highlight}
              showSettings={showSettings}
              onDocumentSelect={onDocumentSelect}
              onSettingsOpen={onSettingsOpen}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};
