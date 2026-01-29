import { api } from './core';
import { AllVariablesResponse } from '@/types/variables';

/**
 * Config API
 * Operations for getting system configuration and variable definitions
 */
export const configApi = {
  /**
   * Get all available variable definitions
   */
  async getAllVariables(): Promise<AllVariablesResponse> {
    const response = await api.get<AllVariablesResponse>('/config/variables');
    return response.data;
  },
};
