import { DriveFile, FolderTree } from "@/types/documents";

export function findInTree(
  tree: FolderTree[],
  targetId: string,
): { type: 'document'; item: DriveFile } | { type: 'folder'; item: FolderTree } | null {
  for (const folder of tree) {
    if (folder.current_folder.id === targetId) {
      return { type: 'folder', item: folder };
    }

    const doc = folder.documents.find((d) => d.id === targetId);
    if (doc) {
      return { type: 'document', item: doc };
    }

    const result = findInTree(folder.folders, targetId);
    if (result) {
      return result;
    }
  }

  return null;
}

export function getExpandPath(tree: FolderTree[], targetId: string, path: string[] = []): string[] | null {
  for (const folder of tree) {
    const currentPath = [...path, folder.current_folder.id];
    if (folder.current_folder.id === targetId || folder.documents.some((d) => d.id === targetId)) {
      return currentPath;
    }
    const result = getExpandPath(folder.folders, targetId, currentPath);
    if (result) {
      return result;
    }
  }

  return null;
}
