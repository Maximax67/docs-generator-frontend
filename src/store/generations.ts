import { create } from 'zustand';
import { api } from '@/lib/api/core';
import { Generation, PaginatedGenerations, PaginationMeta } from '@/types/generations';

interface GenerationsStore {
  generations: Generation[];
  meta: PaginationMeta | null;

  fetchGenerations: (page?: number, pageSize?: number, userId?: string) => Promise<void>;
  deleteGeneration: (id: string) => Promise<void>;
  deleteAllUserGenerations: (userId: string) => Promise<void>;
  regenerateGeneration: (id: string, oldConstants?: boolean) => Promise<Blob>;
}

export const useGenerationsStore = create<GenerationsStore>((set, get) => ({
  generations: [],
  meta: null,

  fetchGenerations: async (page = 1, pageSize = 10, userId?: string): Promise<void> => {
    const res = await api.get<PaginatedGenerations>('/generations', {
      params: { page, page_size: pageSize, user_id: userId },
    });

    set({
      generations: res.data.data,
      meta: res.data.meta,
    });
  },

  deleteGeneration: async (id: string): Promise<void> => {
    await api.delete(`/generations/${id}`);
    const { generations } = get();
    set({ generations: generations.filter((r) => r._id !== id) });
  },

  deleteAllUserGenerations: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}/generations`);
    const { generations } = get();
    set({ generations: generations.filter((r) => r.user?.id !== userId) });
  },

  regenerateGeneration: async (id: string, oldConstants = false): Promise<Blob> => {
    const response = await api.post(`/generations/${id}/regenerate`, null, {
      params: { old_constants: oldConstants },
      responseType: 'blob',
    });

    return response.data;
  },
}));
