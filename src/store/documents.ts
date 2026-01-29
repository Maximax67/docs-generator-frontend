import { create } from 'zustand';
import { documentsApi } from '@/lib/api';
import { toErrorMessage } from '@/utils/errors-messages';
import { DriveFile, DocumentStore } from '@/types/documents';
import { PreviewCache } from '@/lib/cache/preview-cache';

/**
 * Documents Store - State management for document browsing and previews
 * 
 * This store handles:
 * - Folder tree structure
 * - Selected document state
 * - Document preview caching
 * - Loading and error states
 * 
 * All API calls have been moved to the API layer (src/lib/api/documents.api.ts)
 * Preview caching logic has been moved to PreviewCache utility
 */

// Create a singleton cache instance
const previewCache = new PreviewCache();

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  folderTree: null,
  treeLoading: false,
  treeError: null,
  selectedDocument: null,
  previews: {},

  /**
   * Fetch the folder tree structure
   */
  fetchFolderTree: async () => {
    set({ treeLoading: true, treeError: null });

    try {
      const data = await documentsApi.getFolderTree();
      set({
        folderTree: data.tree,
        treeLoading: false,
      });
    } catch (error) {
      set({
        treeError: toErrorMessage(error, 'Не вдалося завантажити структуру папок'),
        treeLoading: false,
      });
    }
  },

  /**
   * Clear tree error state
   */
  clearTreeError: () => {
    set({ treeError: null });
  },

  /**
   * Select a document and trigger preview fetch if needed
   */
  selectDocument: (document: DriveFile) => {
    set({ selectedDocument: document });

    // Auto-fetch preview if not cached
    if (!previewCache.has(document.id)) {
      get().fetchPreview(document.id);
    }
  },

  /**
   * Fetch a document preview
   * Uses caching to avoid redundant API calls
   */
  fetchPreview: async (documentId: string) => {
    // Skip if already loading
    const current = previewCache.get(documentId);
    if (current?.loading) {
      return;
    }

    // Use cached version if valid
    if (previewCache.has(documentId)) {
      return;
    }

    // Set loading state
    const loadingPreview = previewCache.createLoadingPreview(documentId);
    previewCache.set(documentId, loadingPreview);
    set({ previews: previewCache.toRecord() });

    try {
      const blob = await documentsApi.getDocumentPreview(documentId);

      // Convert blob to data URL for display
      await convertBlobToDataUrl(blob, (dataUrl) => {
        const successPreview = previewCache.createSuccessPreview(documentId, dataUrl, blob);
        previewCache.set(documentId, successPreview);
        set({ previews: previewCache.toRecord() });
      });
    } catch (error) {
      const errorPreview = previewCache.createErrorPreview(
        documentId,
        toErrorMessage(error, 'Не вдалося завантажити попередній перегляд'),
      );
      previewCache.set(documentId, errorPreview);
      set({ previews: previewCache.toRecord() });
    }
  },

  /**
   * Clear a specific preview from cache
   */
  clearPreview: (documentId: string) => {
    previewCache.delete(documentId);
    set({ previews: previewCache.toRecord() });
  },

  /**
   * Clear all previews from cache
   */
  clearAllPreviews: () => {
    previewCache.clear();
    set({ previews: {} });
  },
}));

/**
 * Helper function to convert blob to data URL
 */
function convertBlobToDataUrl(blob: Blob, onSuccess: (dataUrl: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      onSuccess(dataUrl);
      resolve();
    };

    reader.onerror = () => {
      reject(new Error('Не вдалося обробити PDF файл'));
    };

    reader.readAsDataURL(blob);
  });
}
