import { api } from './core';
import { FolderTreeResponse } from '@/types/documents';
import { JSONValue } from '@/types/json';
import { DocumentDetails } from '@/types/variables';

/**
 * Documents API
 * Operations for browsing and working with documents
 */
export const documentsApi = {
  /**
   * Get the folder tree structure
   */
  async getFolderTree(): Promise<FolderTreeResponse> {
    const response = await api.get<FolderTreeResponse>('/folders/tree');
    return response.data;
  },

  /**
   * Get document details including variables
   */
  async getDocumentDetails(documentId: string): Promise<DocumentDetails> {
    const response = await api.get<DocumentDetails>(`/documents/${documentId}`);
    return response.data;
  },

  /**
   * Get document preview as PDF blob
   */
  async getDocumentPreview(documentId: string): Promise<Blob> {
    const response = await api.get(`/documents/${documentId}/preview`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate a document with provided variables
   */
  async generateDocument(
    documentId: string,
    variables: Record<string, JSONValue>,
    userId?: string,
  ): Promise<Blob> {
    const url = userId
      ? `/documents/${documentId}/generate/${userId}`
      : `/documents/${documentId}/generate`;

    const response = await api.post(url, { variables }, { responseType: 'blob' });
    return response.data;
  },
};
