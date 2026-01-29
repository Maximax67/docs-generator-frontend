import { Paginated } from '@/types/pagination';
import { api } from './core';
import { Generation } from '@/types/generations';

export interface GetGenerationsParams {
  page?: number;
  pageSize?: number;
  userId?: string;
}

/**
 * Generations API
 * Operations for managing document generations
 */
export const generationsApi = {
  /**
   * Get paginated list of generations
   */
  async getGenerations(params: GetGenerationsParams = {}): Promise<Paginated<Generation>> {
    const { page = 1, pageSize = 10, userId } = params;

    const response = await api.get<Paginated<Generation>>('/generations', {
      params: {
        page,
        page_size: pageSize,
        user_id: userId,
      },
    });

    return response.data;
  },

  /**
   * Delete a specific generation (admin only)
   */
  async deleteGeneration(generationId: string): Promise<void> {
    await api.delete(`/generations/${generationId}`);
  },

  /**
   * Delete all generations for a user (admin only)
   */
  async deleteAllUserGenerations(userId: string): Promise<void> {
    await api.delete(`/generations`, { params: { user_id: userId } });
  },

  /**
   * Regenerate a document from a previous generation
   */
  async regenerateGeneration(generationId: string, useOldConstants = false): Promise<Blob> {
    const response = await api.post(`/generations/${generationId}/regenerate`, null, {
      params: { old_constants: useOldConstants },
      responseType: 'blob',
    });

    return response.data;
  },
};
