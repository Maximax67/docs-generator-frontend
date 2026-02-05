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
import { TreeNodePath, createPath } from '@/utils/document-tree';

interface TreeFolderProps {
  folderTree: FolderTree;
  parentPath: TreeNodePath;
  highlightPath?: TreeNodePath | null;
  expandedPaths: Set<TreeNodePath>;
  level?: number;
  showSettings?: boolean;
  onDocumentSelect: (document: DriveFile, path: TreeNodePath) => void;
  onSettingsOpen?: (id: string, name: string, path: TreeNodePath) => void;
  onPathToggle: (path: TreeNodePath, isExpanded: boolean) => void;
}

export const TreeFolder: FC<TreeFolderProps> = ({
  folderTree,
  parentPath,
  highlightPath,
  expandedPaths,
  level = 0,
  showSettings = false,
  onDocumentSelect,
  onSettingsOpen,
  onPathToggle,
}) => {
  // Create unique path for this folder instance
  const currentPath = createPath(parentPath, folderTree.current_folder.id);
  const isExpanded = expandedPaths.has(currentPath);
  const isHighlighted = currentPath === highlightPath;

  const handleFolderToggle = () => {
    onPathToggle(currentPath, !isExpanded);
  };

  const handleOpenSchemaEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSettingsOpen?.(folderTree.current_folder.id, folderTree.current_folder.name, currentPath);
  };

  const hasChildren = folderTree.folders.length > 0 || folderTree.documents.length > 0;

  return (
    <>
      <ListItemButton
        onClick={handleFolderToggle}
        selected={isHighlighted}
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
        {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {folderTree.folders.map((subfolder) => (
            <TreeFolder
              key={`${currentPath}/${subfolder.current_folder.id}`}
              folderTree={subfolder}
              parentPath={currentPath}
              highlightPath={highlightPath}
              expandedPaths={expandedPaths}
              level={level + 1}
              showSettings={showSettings}
              onDocumentSelect={onDocumentSelect}
              onSettingsOpen={onSettingsOpen}
              onPathToggle={onPathToggle}
            />
          ))}

          {folderTree.documents.map((document) => {
            const docPath = createPath(currentPath, document.id);
            return (
              <TreeDocument
                key={docPath}
                document={document}
                path={docPath}
                highlight={docPath === highlightPath}
                showSettings={showSettings}
                level={level + 1}
                onDocumentSelect={onDocumentSelect}
                onSettingsOpen={onSettingsOpen}
              />
            );
          })}
        </List>
      </Collapse>
    </>
  );
};
