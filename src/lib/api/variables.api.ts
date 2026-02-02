import { api } from './core';
import { VariableSchemaResponse, VariableCreate, DocumentVariableInfo } from '@/types/variables';
import { JSONSchema } from 'jsonjoy-builder';

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
};
