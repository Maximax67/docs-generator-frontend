import { api } from './core';
import { VariablesSchemaResponse } from '@/types/variables';
import { JSONSchema } from 'jsonjoy-builder';


export const variablesApi = {
  async getValidationSchema(scope: string | null): Promise<VariablesSchemaResponse> {
    const response = await api.get<VariablesSchemaResponse>(`/variables/schema`, { params: { scope } });
    return response.data;
  },

  async updateValidationSchema(scope: string | null, schema: JSONSchema): Promise<void> {
    await api.put(`/variables/schema`, { scope, validation_schema: schema });
  },
};
