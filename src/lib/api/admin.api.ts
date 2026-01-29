import { Paginated } from '@/types/pagination';
import { api } from './core';
import { User } from '@/types/user';

/**
 * Admin API - Contains admin-only operations
 * Requires admin or god role
 */
export const adminApi = {
  /**
   * Confirm a user's email address
   */
  async confirmUserEmail(userId: string): Promise<void> {
    await api.post(`/users/${userId}/email/verify`);
  },

  /**
   * Revoke a user's email confirmation
   */
  async revokeUserEmailConfirmation(userId: string): Promise<void> {
    await api.post(`/users/${userId}/email/revoke-verification`);
  },

  /**
   * Ban a user account
   */
  async banUser(userId: string): Promise<void> {
    await api.post(`/users/${userId}/ban`);
  },

  /**
   * Unban a user account
   */
  async unbanUser(userId: string): Promise<void> {
    await api.post(`/users/${userId}/unban`);
  },

  /**
   * Promote a user to admin role (god only)
   */
  async promoteUserToAdmin(userId: string): Promise<void> {
    await api.patch(`/users/${userId}`, { role: 'admin' });
  },

  /**
   * Demote an admin to user role (god only)
   */
  async demoteAdminToUser(userId: string): Promise<void> {
    await api.patch(`/users/${userId}`, { role: 'user' });
  },

  /**
   * Delete a user account (god only)
   */
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },

  /**
   * Change a user's email address (god only)
   */
  async changeUserEmail(userId: string, newEmail: string): Promise<void> {
    await api.patch(`/users/${userId}`, { email: newEmail });
  },

  /**
   * Update a user's names (god only)
   */
  async updateUserNames(
    userId: string,
    firstName: string,
    lastName?: string | null,
  ): Promise<void> {
    await api.patch<User>(`/users/${userId}`, {
      first_name: firstName,
      last_name: lastName ?? null,
    });
  },

  /**
   * Get all users (admin/god only)
   */
  async getUsers(
    page?: number,
    pageSize?: number,
    search?: string,
    role?: string,
    status?: string
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

  /**
   * Get a specific user by ID (admin/god only)
   */
  async getUserById(userId: string): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Delete all generations for a specific user
   */
  async deleteAllUserGenerations(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/generations`);
  },
};
