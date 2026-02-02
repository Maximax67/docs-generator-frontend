import { api } from './core';
import { FolderTreeResponse } from '@/types/documents';
import { JSONValue } from '@/types/json';
import { DocumentDetails } from '@/types/variables';

export const documentsApi = {
  async getFolderTree(): Promise<FolderTreeResponse> {
    const response = await api.get<FolderTreeResponse>('/folders/tree');
    return response.data;
  },

  async getDocumentDetails(documentId: string): Promise<DocumentDetails> {
    const response = await api.get<DocumentDetails>(`/documents/${documentId}`);
    return response.data;
  },

  async getDocumentPreview(documentId: string): Promise<Blob> {
    const response = await api.get(`/documents/${documentId}/preview`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async generateDocument(documentId: string, variables: Record<string, JSONValue>): Promise<Blob> {
    const url = `/documents/${documentId}/generate`;

    const response = await api.post(url, { variables }, { responseType: 'blob' });
    return response.data;
  },
};
