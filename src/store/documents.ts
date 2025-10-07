import { create } from 'zustand';
import { api } from '@/lib/api';
import { toErrorMessage } from '@/lib/api';
import { FolderTreeResponse, DriveFile, DocumentStore } from '@/types/documents';

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  folderTree: null,
  treeLoading: false,
  treeError: null,
  selectedDocument: null,
  previews: {},

  fetchFolderTree: async () => {
    set({ treeLoading: true, treeError: null });

    try {
      const response = await api.get<FolderTreeResponse>('/folders/tree');
      set({
        folderTree: response.data.tree,
        treeLoading: false,
      });
    } catch (error) {
      set({
        treeError: toErrorMessage(error, 'Не вдалося завантажити структуру папок'),
        treeLoading: false,
      });
    }
  },

  clearTreeError: () => {
    set({ treeError: null });
  },

  selectDocument: (document: DriveFile) => {
    set({ selectedDocument: document });

    const { previews, fetchPreview } = get();
    if (!previews[document.id]) {
      fetchPreview(document.id);
    }
  },

  fetchPreview: async (documentId: string) => {
    const { previews } = get();
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000;

    if (previews[documentId]?.loading) {
      return;
    }

    const cached = previews[documentId];
    if (cached?.url && !cached?.error && now - cached.timestamp < CACHE_DURATION) {
      return;
    }

    set({
      previews: {
        ...previews,
        [documentId]: {
          id: documentId,
          url: '',
          loading: true,
          timestamp: now,
        },
      },
    });

    try {
      const response = await api.get(`/documents/${documentId}/preview`, {
        responseType: 'blob',
      });

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;

        set({
          previews: {
            ...previews,
            [documentId]: {
              id: documentId,
              url: dataUrl,
              loading: false,
              timestamp: now,
              blob: response.data,
            },
          },
        });
      };

      reader.onerror = () => {
        set({
          previews: {
            ...previews,
            [documentId]: {
              id: documentId,
              url: '',
              loading: false,
              error: 'Не вдалося обробити PDF файл',
              timestamp: now,
            },
          },
        });
      };

      reader.readAsDataURL(response.data);
    } catch (error) {
      set({
        previews: {
          ...previews,
          [documentId]: {
            id: documentId,
            url: '',
            loading: false,
            error: toErrorMessage(error, 'Не вдалося завантажити попередній перегляд'),
            timestamp: now,
          },
        },
      });
    }
  },

  clearPreview: (documentId: string) => {
    const { previews } = get();
    const newPreviews = { ...previews };
    delete newPreviews[documentId];

    set({ previews: newPreviews });
  },

  clearAllPreviews: () => {
    set({ previews: {} });
  },
}));
