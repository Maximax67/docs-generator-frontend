import { Box, Typography } from '@mui/material';
import { Folder as FolderIcon, Description as DocumentIcon } from '@mui/icons-material';
import { FolderTreeGlobal } from '@/types/documents';
import { findInTree } from '@/utils/document-tree';
import { useDictionary } from '@/contexts/LangContext';

interface ScopeBadgeProps {
  folderTree: FolderTreeGlobal | null;
  scope: string | null;
}

const getScopeNameAndType = (
  folderTree: FolderTreeGlobal | null,
  scopeId: string | null,
  globalScopeName: string,
): [string, boolean] => {
  if (!scopeId) {
    return [globalScopeName, true];
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
  const dict = useDictionary();
  const [name, is_folder] = getScopeNameAndType(folderTree, scope, dict.scope.global);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {is_folder ? <FolderIcon fontSize="small" /> : <DocumentIcon fontSize="small" />}
      <Typography variant="body2">{name}</Typography>
    </Box>
  );
};
