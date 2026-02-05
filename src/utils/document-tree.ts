import { DriveFile, FolderTree, FolderTreeGlobal } from '@/types/documents';

export type TreeNodePath = string; // Format: "parent1/parent2/nodeId"

export function createPath(parentPath: string, nodeId: string): TreeNodePath {
  return parentPath ? `${parentPath}/${nodeId}` : nodeId;
}

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
  currentPath: TreeNodePath = '',
): TreeNodePath[] | null {
  // Check if target is a document at this level
  if (tree.documents.some((d) => d.id === targetId)) {
    return currentPath ? [currentPath] : [];
  }

  // Check folders
  for (const folder of tree.folders) {
    const folderPath = createPath(currentPath, folder.current_folder.id);

    // If this is the folder we're looking for
    if (folder.current_folder.id === targetId) {
      return currentPath ? [currentPath] : [];
    }

    // Recursively search in subfolders
    const result = getExpandPath(folder, targetId, folderPath);
    if (result) {
      return result;
    }
  }

  return null;
}

export function getAllPaths(
  tree: FolderTreeGlobal,
  targetId: string,
  currentPath: TreeNodePath = '',
): TreeNodePath[] {
  const paths: TreeNodePath[] = [];

  // Check if target is a document at this level
  if (tree.documents.some((d) => d.id === targetId)) {
    paths.push(currentPath || 'root');
  }

  // Check folders
  for (const folder of tree.folders) {
    const folderPath = createPath(currentPath, folder.current_folder.id);

    // If this is the folder we're looking for
    if (folder.current_folder.id === targetId) {
      paths.push(currentPath || 'root');
    }

    // Recursively search in subfolders
    const subPaths = getAllPaths(folder, targetId, folderPath);
    paths.push(...subPaths);
  }

  return paths;
}
