import { create } from 'zustand';
import { api } from '@/lib/api/core';
import { Result, PaginatedResults, PaginationMeta } from '@/types/generations';

interface GenerationsStore {
  results: Result[];
  meta: PaginationMeta | null;

  fetchResults: (page?: number, pageSize?: number) => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
  regenerateResult: (id: string, oldConstants?: boolean) => Promise<Blob>;
}

export const useGenerationsStore = create<GenerationsStore>((set, get) => ({
  results: [],
  meta: null,

  fetchResults: async (page = 1, pageSize = 10): Promise<void> => {
    const res = await api.get<PaginatedResults>('/generations', {
      params: { page, page_size: pageSize },
    });
    set({
      results: res.data.data,
      meta: res.data.meta,
    });
  },

  deleteResult: async (id: string): Promise<void> => {
    await api.delete(`/generations/${id}`);
    const { results } = get();
    set({ results: results.filter((r) => r._id !== id) });
  },

  regenerateResult: async (id: string, oldConstants = false): Promise<Blob> => {
    const response = await api.post(`/generations/${id}/regenerate`, null, {
      params: { old_constants: oldConstants },
      responseType: 'blob',
    });

    return response.data;
  },
}));
