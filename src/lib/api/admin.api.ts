import { Paginated } from '@/types/pagination';
import { api } from './core';
import { User } from '@/types/user';

export const adminApi = {
  async confirmUserEmail(userId: string): Promise<void> {
    await api.post(`/users/${userId}/email/verify`);
  },

  async revokeUserEmailConfirmation(userId: string): Promise<void> {
    await api.post(`/users/${userId}/email/revoke-verification`);
  },

  async banUser(userId: string): Promise<void> {
    await api.post(`/users/${userId}/ban`);
  },

  async unbanUser(userId: string): Promise<void> {
    await api.post(`/users/${userId}/unban`);
  },

  async promoteUserToAdmin(userId: string): Promise<void> {
    await api.patch(`/users/${userId}`, { role: 'admin' });
  },

  async demoteAdminToUser(userId: string): Promise<void> {
    await api.patch(`/users/${userId}`, { role: 'user' });
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },

  async changeUserEmail(userId: string, newEmail: string): Promise<void> {
    await api.patch(`/users/${userId}`, { email: newEmail });
  },

  async updateUserNames(userId: string, firstName: string, lastName: string | null): Promise<void> {
    await api.patch<User>(`/users/${userId}`, {
      first_name: firstName,
      last_name: lastName,
    });
  },

  async getUsers(
    page?: number,
    pageSize?: number,
    search?: string,
    role?: string,
    status?: string,
  ): Promise<Paginated<User>> {
    const response = await api.get<Paginated<User>>('/users', {
      params: {
        page,
        pageSize,
        q: search,
        role,
        status,
      },
    });

    return response.data;
  },

  async getUserById(userId: string): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  async deleteAllUserGenerations(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/generations`);
  },
};
