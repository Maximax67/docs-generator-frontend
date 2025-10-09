import { isAxiosError } from 'axios';
import { DocumentDetails } from '@/types/variables';
import { api } from './api/core';
import { toErrorMessage } from '@/utils/errors-messages';

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

  async getDocumentPreview(documentId: string): Promise<Blob> {
    try {
      const response = await api.get(`/documents/${documentId}/preview`, {
        responseType: 'blob',
      });

      return response.data
    } catch (error: unknown) {
      const message = toErrorMessage(error, 'Не вдалося завантажити попередній перегляд');
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
};
