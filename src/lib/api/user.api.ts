import { JSONValue } from '@/types/json';
import { api, bootstrapApi } from './core';
import { User, SessionInfo } from '@/types/user';
import { Paginated } from '@/types/pagination';
import { DocumentVariableInfo, SavedVariable, ValidateVariableResponse } from '@/types/variables';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name?: string;
  password: string;
}

export interface ChangePasswordPayload {
  email: string;
  old_password: string;
  new_password: string;
}

/**
 * Authentication and User API
 * Contains operations for the current authenticated user
 */
export const authApi = {
  /**
   * Bootstrap - Check current auth status and refresh if needed
   */
  async bootstrap(): Promise<User | null> {
    try {
      await bootstrapApi.post('/auth/refresh');
      const response = await bootstrapApi.get<User>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    await api.post('/auth/login', credentials);
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Register a new user account
   */
  async register(payload: RegisterPayload): Promise<User> {
    await api.post('/auth/register', payload);
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Logout from current session
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /**
   * Logout from all sessions
   */
  async logoutEverywhere(): Promise<void> {
    await api.post('/auth/logout_all');
  },

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<User> {
    await api.post('/auth/refresh');
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Send email confirmation link
   */
  async sendEmailConfirmation(): Promise<void> {
    await api.post('/auth/email/send-confirmation');
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await api.post(`/auth/email/verify?token=${encodeURIComponent(token)}`);
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/password/forgot', { email });
  },

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    await api.post(`/auth/password/reset?token=${encodeURIComponent(token)}`, {
      new_password: newPassword,
    });
  },

  /**
   * Change email address
   */
  async changeEmail(newEmail: string): Promise<void> {
    await api.post('/auth/email/change', { new_email: newEmail });
  },

  /**
   * Change password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post('/auth/password/change', payload);
  },

  /**
   * List all active sessions
   */
  async listSessions(): Promise<SessionInfo[]> {
    const response = await api.get<SessionInfo[]>('/auth/sessions');
    return response.data;
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${encodeURIComponent(sessionId)}`);
  },
};

/**
 * User Profile API
 * Operations on the current user's profile
 */
export const userApi = {
  /**
   * Update current user's names
   */
  async updateNames(userId: string, firstName: string, lastName?: string | null): Promise<User> {
    await api.patch<User>(`/users/${userId}`, {
      first_name: firstName,
      last_name: lastName ?? null,
    });
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Delete current user's account
   */
  async deleteAccount(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },

  /**
   * Get saved variables for current user (paginated)
   */
  async getSavedVariables(page = 1, pageSize = 25): Promise<Paginated<SavedVariable>> {
    const response = await api.get<Paginated<SavedVariable>>('/variables/saved', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  /**
   * Clear all saved variables
   */
  async clearSavedVariables(): Promise<void> {
    await api.delete('/variables/saved');
  },

  /**
   * Get variable info by variable name
   */
  async getVariableInfo(variableId: string): Promise<DocumentVariableInfo> {
    const response = await api.get<DocumentVariableInfo>(`/variables/${encodeURIComponent(variableId)}`);
    return response.data;
  },

  /**
   * Validate a variable value against its schema
   */
  async validateVariable(variableId: string, value: JSONValue): Promise<ValidateVariableResponse> {
    const response = await api.post<ValidateVariableResponse>(
      `/variables/${encodeURIComponent(variableId)}/validate`,
      { value }
    );
    return response.data;
  },

  /**
   * Update a specific saved variable
   */
  async updateSavedVariable(variableId: string, value: JSONValue): Promise<void> {
    await api.post(`/variables/${encodeURIComponent(variableId)}/save`, { value });
  },

  /**
   * Delete a specific saved variable
   */
  async deleteSavedVariable(variableId: string): Promise<void> {
    await api.post(`/variables/${encodeURIComponent(variableId)}/forget`);
  },
};
