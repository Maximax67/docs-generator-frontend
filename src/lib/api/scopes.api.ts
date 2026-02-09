import { isAxiosError } from '@/utils/is-axios-error';
import { api } from './core';
import { ScopeCreate, ScopeResponse, ScopeRestrictions } from '@/types/scopes';

export const scopesApi = {
  async getScope(driveId: string): Promise<ScopeResponse | null> {
    try {
      const response = await api.get<ScopeResponse>(`/drive/scopes/${driveId}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async createScope(data: ScopeCreate): Promise<ScopeResponse> {
    const response = await api.post<ScopeResponse>('/drive/scopes', data);
    return response.data;
  },

  async updateScopeRestrictions(
    driveId: string,
    restrictions: ScopeRestrictions,
  ): Promise<ScopeResponse> {
    const response = await api.put<ScopeResponse>(`/drive/scopes/${driveId}/restrictions`, {
      restrictions,
    });
    return response.data;
  },

  async pinScope(driveId: string): Promise<ScopeResponse> {
    const response = await api.post<ScopeResponse>(`/drive/scopes/${driveId}/pin`);
    return response.data;
  },

  async unpinScope(driveId: string): Promise<ScopeResponse> {
    const response = await api.post<ScopeResponse>(`/drive/scopes/${driveId}/unpin`);
    return response.data;
  },

  async deleteScope(driveId: string): Promise<void> {
    await api.delete(`/drive/scopes/${driveId}`);
  },
};
