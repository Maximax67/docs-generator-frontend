import { DriveFile, FolderTree, FolderTreeGlobal } from '@/types/documents';

export function findInTree(
  tree: FolderTreeGlobal,
  targetId: string,
): { type: 'document'; item: DriveFile } | { type: 'folder'; item: FolderTree } | null {
  const doc = tree.documents.find((d) => d.id === targetId);
  if (doc) {
    return { type: 'document', item: doc };
  }

  for (const folder of tree.folders) {
    if (folder.current_folder.id === targetId) {
      return { type: 'folder', item: folder };
    }

    const result = findInTree(folder, targetId);
    if (result) {
      return result;
    }
  }

  return null;
}

export function getExpandPath(
  tree: FolderTreeGlobal,
  targetId: string,
  path: string[] = [],
): string[] | null {
  if (tree.documents.some((d) => d.id === targetId)) {
    return path;
  }

  for (const folder of tree.folders) {
    const currentPath = [...path, folder.current_folder.id];
    const result = getExpandPath(folder, targetId, currentPath);
    if (result) {
      return result;
    }
  }

  return null;
}
