import { create } from 'zustand';
import { api } from '@/lib/api/core';
import { toErrorMessage } from '@/utils/errors-messages';
import { FolderTreeResponse, DriveFile, DocumentStore } from '@/types/documents';
import { documentApi } from '@/lib/documentApi';

const CACHE_DURATION = 10 * 60 * 1000;

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

    if (previews[documentId]?.loading) {
      return;
    }

    const cached = previews[documentId];
    if (cached?.url && !cached?.error && now - cached.timestamp < CACHE_DURATION) {
      return;
    }

    set(state => ({
      previews: {
        ...state.previews,
        [documentId]: {
          id: documentId,
          url: '',
          loading: true,
          timestamp: now,
        },
      },
    }));

    try {
      const blob = await documentApi.getDocumentPreview(documentId);

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;

        set(state => ({
          previews: {
            ...state.previews,
            [documentId]: {
              id: documentId,
              url: dataUrl,
              loading: false,
              timestamp: now,
              blob,
            },
          },
        }));
      };

      reader.onerror = () => {
        set(state => ({
          previews: {
            ...state.previews,
            [documentId]: {
              id: documentId,
              url: '',
              loading: false,
              error: 'Не вдалося обробити PDF файл',
              timestamp: now,
            },
          },
        }));
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      set(state => ({
        previews: {
          ...state.previews,
          [documentId]: {
            id: documentId,
            url: '',
            loading: false,
            error: toErrorMessage(error, 'Не вдалося завантажити попередній перегляд'),
            timestamp: now,
          },
        },
      }));
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
