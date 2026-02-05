import { api } from './core';
import { DocumentDetails, FolderTree, FolderTreeGlobal } from '@/types/documents';
import { JSONValue } from '@/types/json';

export const documentsApi = {
  async getGlobalFolderTree(): Promise<FolderTreeGlobal> {
    const response = await api.get<FolderTreeGlobal>('/drive/tree');
    return response.data;
  },

  async getFolderTree(folderId: string): Promise<FolderTree> {
    const response = await api.get<FolderTree>('/drive/tree', { params: { folderId } });
    return response.data;
  },

  async getDocumentDetails(documentId: string): Promise<DocumentDetails> {
    const response = await api.get<DocumentDetails>(`/drive/documents/${documentId}`);
    return response.data;
  },

  async getDocumentPreview(documentId: string, format: string = "pdf"): Promise<Blob> {
    const response = await api.get(`/drive/documents/${documentId}/preview`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  async generateDocument(documentId: string, variables: Record<string, JSONValue>, format: string = "pdf"): Promise<Blob> {
    const url = `/drive/documents/${documentId}/generate`;

    const response = await api.post(url, { variables }, { params: { format }, responseType: 'blob' });
    return response.data;
  },
};
