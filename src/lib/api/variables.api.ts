import { Paginated } from '@/types/pagination';
import { api } from './core';
import {
  VariableSchemaResponse,
  VariableCreate,
  DocumentVariableInfo,
  SaveVariableEntry,
  SavedVariable,
  ValidateVariableResponse,
} from '@/types/variables';
import { JSONSchema } from 'jsonjoy-builder';
import { JSONValue } from '@/types/json';

export const variablesApi = {
  async getValidationSchema(scope: string | null): Promise<VariableSchemaResponse> {
    const response = await api.get<VariableSchemaResponse>('/variables/schema', {
      params: { scope },
    });
    return response.data;
  },

  async updateValidationSchema(scope: string | null, schema: JSONSchema): Promise<void> {
    await api.put('/variables/schema', {
      scope,
      validation_schema: schema,
    });
  },

  async createVariable(data: VariableCreate): Promise<DocumentVariableInfo> {
    const response = await api.post('/variables', data);
    return response.data;
  },

  async updateVariable(id: string, data: VariableCreate): Promise<DocumentVariableInfo> {
    const response = await api.put(`/variables/${id}`, data);
    return response.data;
  },

  async deleteVariable(id: string): Promise<void> {
    await api.delete(`/variables/${id}`);
  },

  async saveVariables(variables: SaveVariableEntry[]): Promise<void> {
    await api.post('/variables/save', { variables });
  },

  async getSavedVariables(page = 1, pageSize = 25): Promise<Paginated<SavedVariable>> {
    const response = await api.get<Paginated<SavedVariable>>('/variables/saved', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  async clearSavedVariables(): Promise<void> {
    await api.delete('/variables/saved');
  },

  async getVariableInfo(variableId: string): Promise<DocumentVariableInfo> {
    const response = await api.get<DocumentVariableInfo>(
      `/variables/${encodeURIComponent(variableId)}`,
    );
    return response.data;
  },

  async validateVariable(variableId: string, value: JSONValue): Promise<ValidateVariableResponse> {
    const response = await api.post<ValidateVariableResponse>(
      `/variables/${encodeURIComponent(variableId)}/validation`,
      { value },
    );
    return response.data;
  },

  async updateSavedVariable(variableId: string, value: JSONValue): Promise<void> {
    await api.post(`/variables/${encodeURIComponent(variableId)}/save`, { value });
  },

  async deleteSavedVariable(variableId: string): Promise<void> {
    await api.post(`/variables/${encodeURIComponent(variableId)}/forget`);
  },
};
