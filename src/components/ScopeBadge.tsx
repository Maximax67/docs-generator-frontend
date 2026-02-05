import { Box, Typography } from '@mui/material';
import { Folder as FolderIcon, Description as DocumentIcon } from '@mui/icons-material';
import { FolderTreeGlobal } from '@/types/documents';
import { findInTree } from '@/utils/document-tree';

interface ScopeBadgeProps {
  folderTree: FolderTreeGlobal | null;
  scope: string | null;
}

const getScopeNameAndType = (
  folderTree: FolderTreeGlobal | null,
  scopeId: string | null,
): [string, boolean] => {
  if (!scopeId) {
    return ['Глобальний', true];
  }

  if (!folderTree) {
    return [scopeId, true];
  }

  const result = findInTree(folderTree, scopeId);
  if (result) {
    if (result.type === 'folder') {
      return [result.item.current_folder.name, result.type === 'folder'];
    }

    return [result.item.name, false];
  }

  return [scopeId, true];
};

export const ScopeBadge = ({ folderTree, scope }: ScopeBadgeProps) => {
  const [name, is_folder] = getScopeNameAndType(folderTree, scope);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {is_folder ? <FolderIcon fontSize="small" /> : <DocumentIcon fontSize="small" />}
      <Typography variant="body2">{name}</Typography>
    </Box>
  );
};
