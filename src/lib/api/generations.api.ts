import { Paginated } from '@/types/pagination';
import { api } from './core';
import { Generation } from '@/types/generations';
import { JSONValue } from '@/types/json';

export interface GetGenerationsParams {
  page?: number;
  pageSize?: number;
  userId?: string;
}

export const generationsApi = {
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

  async deleteGeneration(generationId: string): Promise<void> {
    await api.delete(`/generations/${generationId}`);
  },

  async deleteAllUserGenerations(userId: string): Promise<void> {
    await api.delete(`/generations`, { params: { user_id: userId } });
  },

  async regenerateGeneration(
    generationId: string,
    variables?: Record<string, JSONValue>,
  ): Promise<Blob> {
    const response = await api.post(
      `/generations/${generationId}/regenerate`,
      { variables },
      {
        responseType: 'blob',
      },
    );

    return response.data;
  },
};
