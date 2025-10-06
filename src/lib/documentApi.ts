import { isAxiosError } from 'axios';
import { api } from './api';
import { toErrorMessage } from './api';
import { DocumentDetails, DocumentVariables, ValidationErrors } from '@/types/variables';

export class DocumentApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'DocumentApiError';
  }
}

export const documentApi = {
  async getDocumentDetails(documentId: string): Promise<DocumentDetails> {
    try {
      const response = await api.get<DocumentDetails>(`/documents/${documentId}`);
      return response.data;
    } catch (error: unknown) {
      const message = toErrorMessage(error, 'Не вдалося завантажити деталі документа');
      const status = isAxiosError(error) ? error.response?.status : undefined;

      throw new DocumentApiError(message, status);
    }
  },

  async getDocumentVariables(documentId: string): Promise<DocumentVariables> {
    try {
      const response = await api.get<DocumentVariables>(`/documents/${documentId}/variables`);
      return response.data;
    } catch (error: unknown) {
      const message = toErrorMessage(error, 'Не вдалося завантажити змінні документа');
      const status = isAxiosError(error) ? error.response?.status : undefined;

      throw new DocumentApiError(message, status);
    }
  },

  async validateVariables(
    documentId: string,
    variables: Record<string, string>,
  ): Promise<ValidationErrors> {
    try {
      const response = await api.post<ValidationErrors>(`/documents/${documentId}/validate`, {
        variables,
      });
      return response.data;
    } catch (error: unknown) {
      const message = toErrorMessage(error, 'Не вдалося перевірити змінні');
      const status = isAxiosError(error) ? error.response?.status : undefined;

      throw new DocumentApiError(message, status);
    }
  },

  async generateDocument(
    documentId: string,
    variables: Record<string, string>,
    userId?: string,
  ): Promise<Blob> {
    try {
      const response = await api.post(
        userId
          ? `/documents/${documentId}/generate/${userId}`
          : `/documents/${documentId}/generate`,
        { variables },
        { responseType: 'blob' },
      );
      return response.data;
    } catch (error: unknown) {
      const message = toErrorMessage(error, 'Не вдалося згенерувати документ');
      const status = isAxiosError(error) ? error.response?.status : undefined;

      throw new DocumentApiError(message, status);
    }
  },

  async getSavedVariables(userId: string): Promise<Record<string, string>> {
    try {
      const response = await api.get<Record<string, string>>(`/users/${userId}/saved_variables`);
      return response.data;
    } catch (error: unknown) {
      const message = toErrorMessage(error, 'Не вдалося завантажити збережені змінні');
      const status = isAxiosError(error) ? error.response?.status : undefined;

      throw new DocumentApiError(message, status);
    }
  },

  async saveVariable(userId: string, variable: string, value: string): Promise<void> {
    try {
      await api.patch(
        `/users/${userId}/saved_variables/${variable}?value=${encodeURIComponent(value)}`,
      );
    } catch (error: unknown) {
      const message = toErrorMessage(error, 'Не вдалося зберегти змінну');
      const status = isAxiosError(error) ? error.response?.status : undefined;

      throw new DocumentApiError(message, status);
    }
  },

  async deleteSavedVariable(userId: string, variable: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}/saved_variables/${variable}`);
    } catch (error: unknown) {
      const message = toErrorMessage(error, 'Не вдалося видалити збережену змінну');
      const status = isAxiosError(error) ? error.response?.status : undefined;

      throw new DocumentApiError(message, status);
    }
  },
};
