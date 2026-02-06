import { api, bootstrapApi } from './core';
import { User, SessionInfo } from '@/types/user';

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

export const authApi = {
  async bootstrap(): Promise<User | null> {
    await bootstrapApi.post('/auth/refresh');
    const response = await bootstrapApi.get<User>('/auth/me');
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<User> {
    await api.post('/auth/login', credentials);
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    await api.post('/auth/register', payload);
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async logoutEverywhere(): Promise<void> {
    await api.delete('/auth/sessions');
  },

  async refreshSession(): Promise<User> {
    await api.post('/auth/refresh');
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async sendEmailConfirmation(): Promise<void> {
    await api.post('/auth/email/send-confirmation');
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post(`/auth/email/verify?token=${encodeURIComponent(token)}`);
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/password/forgot', { email });
  },

  async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    await api.post(`/auth/password/reset?token=${encodeURIComponent(token)}`, {
      new_password: newPassword,
    });
  },

  async changeEmail(newEmail: string): Promise<void> {
    await api.post('/auth/email/change', { new_email: newEmail });
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post('/auth/password/change', payload);
  },

  async listSessions(): Promise<SessionInfo[]> {
    const response = await api.get<SessionInfo[]>('/auth/sessions');
    return response.data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${encodeURIComponent(sessionId)}`);
  },
};

export const userApi = {
  async updateNames(userId: string, firstName: string, lastName?: string | null): Promise<User> {
    await api.patch<User>(`/users/${userId}`, {
      first_name: firstName,
      last_name: lastName ?? null,
    });
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async deleteAccount(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },
};
