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
import { toErrorMessage } from '@/utils/errors-messages';
import { markBootstrapComplete } from '@/lib/api/setup/bootstrap';
import { isAxiosError } from '@/utils/is-axios-error';

/**
 * User Store - State management for authentication and user data
 * 
 * This store handles:
 * - Authentication state (login, logout, registration)
 * - Current user data
 * - Rate limiting state
 * - Loading and error states
 * 
 * All API calls have been moved to the API layer (src/lib/api)
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      rateLimitedUntil: null,

      // Rate limiting
      setRateLimit: (until) => set({ rateLimitedUntil: until }),
      clearRateLimit: () => set({ rateLimitedUntil: null }),

      // Basic state management
      setUser: (u) => set({ user: u }),
      clearError: () => set({ error: null }),
      logoutLocal: () => set({ user: null }),

      // Bootstrap - check auth status on app start
      bootstrap: async () => {
        const storedUser = get().user;
        if (!storedUser) {
          markBootstrapComplete();
          return;
        }

        try {
          const user = await authApi.bootstrap();
          set({ user, error: null });
        } catch (error: unknown) {
          if (isAxiosError(error)) {
            const status = error.response?.status;
            switch (status) {
              case 401:
                set({ user: null });
                break;
              case 429:
                set({ error: 'Too many requests, please try again later.' });
                break;
              default:
                const message = toErrorMessage(error, `Server error: ${status ?? 'unknown'}`);
                set({ error: message });
                break;
            }
          } else if (error instanceof Error) {
            set({ error: error.message });
          } else {
            set({ error: 'Сталася помилка' });
          }
        } finally {
          markBootstrapComplete();
        }
      },

      // Authentication operations
      loginWithCredentials: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const credentials: LoginCredentials = { email, password };
          const user = await authApi.login(credentials);
          set({ user, loading: false });
          return true;
        } catch (e) {
          set({ error: toErrorMessage(e) || 'Помилка входу', loading: false });
          return false;
        }
      },

      registerWithCredentials: async (payload) => {
        set({ loading: true, error: null });
        try {
          const registerPayload: RegisterPayload = {
            email: payload.email,
            first_name: payload.first_name,
            last_name: payload.last_name,
            password: payload.password,
          };
          const user = await authApi.register(registerPayload);
          set({ user, loading: false });
          return true;
        } catch (e) {
          set({ error: toErrorMessage(e) || 'Помилка реєстрації', loading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ user: null });
        }
      },

      logoutEverywhere: async () => {
        try {
          await authApi.logoutEverywhere();
        } finally {
          set({ user: null });
        }
      },

      refeshSession: async () => {
        const user = await authApi.refreshSession();
        set({ user });
      },

      // Email operations
      sendEmailConfirmation: async () => {
        await authApi.sendEmailConfirmation();
      },

      verifyEmail: async (token: string) => {
        await authApi.verifyEmail(token);
        set(state => ({
          user: state.user
            ? { ...state.user, email_verified: true }
            : null
        }));
      },

      changeEmail: async (newEmail: string) => {
        await authApi.changeEmail(newEmail);
        set({ user: null });
      },

      // Password operations
      requestPasswordReset: async (email: string) => {
        await authApi.requestPasswordReset(email);
      },

      changePasswordWithToken: async (token: string, newPassword: string) => {
        await authApi.resetPasswordWithToken(token, newPassword);
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        const u = get().user;
        if (!u?.email) throw new Error('Електронна пошта відсутня');

        const payload: ChangePasswordPayload = {
          email: u.email,
          old_password: oldPassword,
          new_password: newPassword,
        };
        await authApi.changePassword(payload);
        set({ user: null });
      },

      // Profile operations
      updateNames: async (firstName: string, lastName?: string | null) => {
        const u = get().user;
        if (!u?._id) throw new Error('Користувач не знайдений');

        const user = await userApi.updateNames(u._id, firstName, lastName);
        set({ user });
      },

      deleteAccount: async () => {
        const u = get().user;
        if (!u?._id) throw new Error('Користувач не знайдений');

        await userApi.deleteAccount(u._id);
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
