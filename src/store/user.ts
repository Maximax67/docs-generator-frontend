'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, toErrorMessage } from '@/lib/api';
import { UserState, SessionInfo, User, AllUsersResponse } from '@/types/user';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      rateLimitedUntil: null,
      setRateLimit: (until) => set({ rateLimitedUntil: until }),
      clearRateLimit: () => set({ rateLimitedUntil: null }),
      setUser: (u) => set({ user: u }),
      clearError: () => set({ error: null }),
      logoutLocal: () => set({ user: null }),
      bootstrap: async () => {
        const storedUser = get().user;
        if (!storedUser) return;
        try {
          await api.post('/auth/refresh');
          const me = await api.get<User>('/auth/me');
          set({ user: me.data, error: null });
        } catch {
          set({ user: null });
        }
      },
      loginWithCredentials: async (email, password, sessionName) => {
        set({ loading: true, error: null });
        try {
          await api.post('/auth/login', {
            email,
            password,
            session_name: sessionName,
          });
          const me = await api.get<User>('/auth/me');
          set({ user: me.data, loading: false });
          return true;
        } catch (e) {
          set({ error: toErrorMessage(e) || 'Помилка входу', loading: false });
          return false;
        }
      },
      registerWithCredentials: async (payload) => {
        set({ loading: true, error: null });
        try {
          await api.post('/auth/register', {
            email: payload.email,
            first_name: payload.first_name,
            last_name: payload.last_name,
            password: payload.password,
            session_name: payload.session_name,
          });
          const me = await api.get<User>('/auth/me');
          set({ user: me.data, loading: false });
          return true;
        } catch (e) {
          set({ error: toErrorMessage(e) || 'Помилка реєстрації', loading: false });
          return false;
        }
      },
      requestPasswordReset: async (email: string) => {
        await api.post('/auth/password/forgot', { email });
      },
      changePasswordWithToken: async (token: string, newPassword: string) => {
        await api.post(`/auth/password/reset?token=${encodeURIComponent(token)}`, {
          new_password: newPassword,
        });
      },
      logoutEverywhere: async () => {
        try {
          await api.post('/auth/logout_all');
        } finally {
          set({ user: null });
        }
      },
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } finally {
          set({ user: null });
        }
      },
      sendEmailConfirmation: async () => {
        await api.post('/auth/email/send-confirmation');
      },
      confirmEmail: async (userId: string) => {
        const u = get().user;
        if (u?.role !== 'admin' && u?.role !== 'god')
          throw new Error('Потрібен акаунт адміністратора');

        await api.post(`/users/${userId}/email/verify`);
      },
      revokeConfirmEmail: async (userId: string) => {
        const u = get().user;
        if (u?.role !== 'admin' && u?.role !== 'god')
          throw new Error('Потрібен акаунт адміністратора');

        await api.post(`/users/${userId}/email/revoke-verification`);
      },
      changeUserEmail: async (userId: string, newEmail: string) => {
        const u = get().user;
        if (u?.role !== 'god') throw new Error('Потрібно бути богом');

        await api.patch(`/users/${userId}`, { email: newEmail });
      },
      banUser: async (userId: string) => {
        const u = get().user;
        if (u?.role !== 'admin' && u?.role !== 'god')
          throw new Error('Потрібен акаунт адміністратора');

        await api.post(`/users/${userId}/ban`);
      },
      unbanUser: async (userId: string) => {
        const u = get().user;
        if (u?.role !== 'admin' && u?.role !== 'god')
          throw new Error('Потрібен акаунт адміністратора');

        await api.post(`/users/${userId}/unban`);
      },
      promoteUser: async (userId: string) => {
        const u = get().user;
        if (u?.role !== 'god') throw new Error('Потрібно бути богом');

        await api.patch(`/users/${userId}`, { role: 'admin' });
      },
      demoteUser: async (userId: string) => {
        const u = get().user;
        if (u?.role !== 'god') throw new Error('Потрібно бути богом');

        await api.patch(`/users/${userId}`, { role: 'user' });
      },
      deleteUser: async (userId: string) => {
        const u = get().user;
        if (u?.role !== 'god') throw new Error('Потрібно бути богом');

        await api.delete(`/users/${userId}`);
      },
      verifyEmail: async (token: string) => {
        await api.post(`/auth/email/verify?token=${encodeURIComponent(token)}`);
        const u = get().user;
        if (u?._id) {
          u.email_verified = true;
          set({ user: u });
        }
      },
      changeEmail: async (newEmail: string) => {
        await api.post('/auth/email/change', { new_email: newEmail });
        const me = await api.get<User>('/auth/me');
        set({ user: me.data });
      },
      changePassword: async (oldPassword: string, newPassword: string) => {
        const u = get().user;
        if (!u?.email) throw new Error('Електронна пошта відсутня');
        await api.post('/auth/password/change', {
          email: u.email,
          old_password: oldPassword,
          new_password: newPassword,
        });
        set({ user: null });
      },
      deleteAccount: async () => {
        const u = get().user;
        if (!u?._id) throw new Error('Користувач не знайдений');

        await api.delete(`/users/${u._id}`);
        set({ user: null });
      },
      updateNames: async (firstName: string, lastName?: string | null) => {
        const u = get().user;
        if (!u?._id) throw new Error('Користувач не знайдений');
        await api.patch<User>(`/users/${u._id}`, {
          first_name: firstName,
          last_name: lastName ?? null,
        });
        const me = await api.get<User>('/auth/me');
        set({ user: me.data });
      },
      updateUserNames: async (userId: string, firstName: string, lastName?: string | null) => {
        const u = get().user;
        if (u?.role !== 'god') throw new Error('Потрібно бути богом');

        await api.patch<User>(`/users/${userId}`, {
          first_name: firstName,
          last_name: lastName ?? null,
        });
      },
      listSessions: async () => {
        const res = await api.get<SessionInfo[]>('/auth/sessions');
        return res.data;
      },
      revokeSession: async (sessionId: string) => {
        await api.delete(`/auth/sessions/${encodeURIComponent(sessionId)}`);
      },
      getSavedVariables: async () => {
        const u = get().user;
        if (!u?._id) throw new Error('Користувач не знайдений');
        const res = await api.get<Record<string, string>>(`/users/${u._id}/saved_variables`);
        return res.data;
      },
      setSavedVariables: async (vars: Record<string, string>) => {
        const u = get().user;
        if (!u?._id) throw new Error('Користувач не знайдений');
        const me = await api.put<User>(`/users/${u._id}/saved_variables`, vars);
        set({ user: me.data });

        return me.data;
      },
      updateSavedVariable: async (key: string, value: string) => {
        const u = get().user;
        if (!u?._id) throw new Error('Користувач не знайдений');
        const me = await api.patch<User>(
          `/users/${u._id}/saved_variables/${encodeURIComponent(key)}?value=${encodeURIComponent(value)}`,
        );
        set({ user: me.data });

        return me.data;
      },
      deleteSavedVariable: async (key: string) => {
        const u = get().user;
        if (!u?._id) throw new Error('Користувач не знайдений');
        const me = await api.delete<User>(
          `/users/${u._id}/saved_variables/${encodeURIComponent(key)}`,
        );
        set({ user: me.data });

        return me.data;
      },
      clearSavedVariables: async () => {
        const u = get().user;
        if (!u?._id) throw new Error('Користувач не знайдений');
        const me = await api.delete<User>(`/users/${u._id}/saved_variables`);
        set({ user: me.data });

        return me.data;
      },
      getUserSavedVariables: async (userId: string) => {
        const u = get().user;
        if (u?.role !== 'admin' && u?.role !== 'god')
          throw new Error('Потрібен акаунт адміністратора');
        const res = await api.get<Record<string, string>>(`/users/${userId}/saved_variables`);

        return res.data;
      },
      setUserSavedVariables: async (userId: string, vars: Record<string, string>) => {
        const u = get().user;
        if (u?.role !== 'god') throw new Error('Потрібно бути богом');

        const res = await api.put<User>(`/users/${userId}/saved_variables`, vars);
        return res.data;
      },
      updateUserSavedVariable: async (userId: string, key: string, value: string) => {
        const u = get().user;
        if (u?.role !== 'god') throw new Error('Потрібно бути богом');

        const res = await api.patch<User>(
          `/users/${userId}/saved_variables/${encodeURIComponent(key)}?value=${encodeURIComponent(value)}`,
        );
        return res.data;
      },
      deleteUserSavedVariable: async (userId: string, key: string) => {
        const u = get().user;
        if (u?.role !== 'god') throw new Error('Потрібно бути богом');

        const res = await api.delete<User>(
          `/users/${userId}/saved_variables/${encodeURIComponent(key)}`,
        );
        return res.data;
      },
      clearUserSavedVariables: async (userId: string) => {
        const u = get().user;
        if (u?.role !== 'god') throw new Error('Потрібно бути богом');
        const res = await api.delete<User>(`/users/${userId}/saved_variables`);

        return res.data;
      },
      getAllUsers: async () => {
        const u = get().user;
        if (u?.role !== 'admin' && u?.role !== 'god')
          throw new Error('Потрібен акаунт адміністратора');
        const resp = await api.get<AllUsersResponse>('/users');

        return resp.data.users;
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ user: state.user }),
      version: 1,
    },
  ),
);
