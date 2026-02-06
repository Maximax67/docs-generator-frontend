'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  authApi,
  userApi,
  type LoginCredentials,
  type RegisterPayload,
  type ChangePasswordPayload,
} from '@/lib/api';
import { UserState } from '@/types/user';
import { markBootstrapComplete } from '@/lib/api/setup/bootstrap';
import { tokenManager } from '@/lib/api/setup/token-manager';
import { isAxiosError } from '@/utils/is-axios-error';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (u) => set({ user: u }),

      logoutLocal: () => {
        tokenManager.clear();
        set({ user: null });
      },

      bootstrap: async () => {
        const storedUser = get().user;

        // If no stored user, complete bootstrap immediately
        if (!storedUser) {
          markBootstrapComplete();
          return;
        }

        // Check if we should refresh the token
        // Only refresh if enough time has passed
        if (!tokenManager.shouldRefreshOnBootstrap()) {
          // Token is still valid, no need to refresh
          markBootstrapComplete();
          return;
        }

        // Token might be expired, attempt refresh
        try {
          const user = await authApi.bootstrap();
          set({ user });
          tokenManager.markRefreshed();
        } catch (error) {
          if (isAxiosError(error)) {
            const status = error.response?.status;
            // Only logout on 401 (unauthorized)
            if (status === 401) {
              tokenManager.clear();
              set({ user: null });
            }
            // For other errors (500, 429, network issues), keep user logged in
            // They might be able to retry later
          }
        } finally {
          markBootstrapComplete();
        }
      },

      loginWithCredentials: async (email, password) => {
        const credentials: LoginCredentials = { email, password };
        const user = await authApi.login(credentials);
        tokenManager.markRefreshed();
        set({ user });
      },

      registerWithCredentials: async (payload) => {
        const registerPayload: RegisterPayload = {
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          password: payload.password,
        };
        const user = await authApi.register(registerPayload);
        tokenManager.markRefreshed();
        set({ user });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          tokenManager.clear();
          set({ user: null });
        }
      },

      logoutEverywhere: async () => {
        await authApi.logoutEverywhere();
        tokenManager.clear();
        set({ user: null });
      },

      refeshSession: async () => {
        const user = await authApi.refreshSession();
        tokenManager.markRefreshed();
        set({ user });
      },

      sendEmailConfirmation: async () => {
        await authApi.sendEmailConfirmation();
      },

      verifyEmail: async (token) => {
        await authApi.verifyEmail(token);
        set((state) => ({
          user: state.user ? { ...state.user, email_verified: true } : null,
        }));
      },

      changeEmail: async (newEmail) => {
        await authApi.changeEmail(newEmail);
        tokenManager.clear();
        set({ user: null });
      },

      requestPasswordReset: async (email) => {
        await authApi.requestPasswordReset(email);
      },

      changePasswordWithToken: async (token, newPassword) => {
        await authApi.resetPasswordWithToken(token, newPassword);
      },

      changePassword: async (oldPassword, newPassword) => {
        const u = get().user;
        if (!u?.id) throw new Error('Користувач не знайдений');

        const payload: ChangePasswordPayload = {
          email: u.email,
          old_password: oldPassword,
          new_password: newPassword,
        };
        await authApi.changePassword(payload);
        tokenManager.clear();
        set({ user: null });
      },

      updateNames: async (firstName, lastName) => {
        const u = get().user;
        if (!u?.id) throw new Error('Користувач не знайдений');

        const user = await userApi.updateNames(u.id, firstName, lastName);
        set({ user });
      },

      deleteAccount: async () => {
        const u = get().user;
        if (!u?.id) throw new Error('Користувач не знайдений');

        await userApi.deleteAccount(u.id);
        tokenManager.clear();
        set({ user: null });
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ user: state.user }),
      version: 1,
    },
  ),
);
