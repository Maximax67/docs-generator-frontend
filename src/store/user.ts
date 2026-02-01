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
import { isAxiosError } from '@/utils/is-axios-error';


export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (u) => set({ user: u }),
      logoutLocal: () => set({ user: null }),

      bootstrap: async () => {
        const storedUser = get().user;
        if (!storedUser) {
          markBootstrapComplete();
          return;
        }

        try {
          const user = await authApi.bootstrap();
          set({ user });
        } catch (error: unknown) {
          if (isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401) {
              set({ user: null });
            }
          }
        } finally {
          markBootstrapComplete();
        }
      },

      loginWithCredentials: async (email, password) => {
        const credentials: LoginCredentials = { email, password };
        const user = await authApi.login(credentials);
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
        set({ user });
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

      sendEmailConfirmation: async () => {
        await authApi.sendEmailConfirmation();
      },

      verifyEmail: async (token) => {
        await authApi.verifyEmail(token);
        set(state => ({
          user: state.user
            ? { ...state.user, email_verified: true }
            : null
        }));
      },

      changeEmail: async (newEmail) => {
        await authApi.changeEmail(newEmail);
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
        if (!u?._id) throw new Error('Користувач не знайдений');

        const payload: ChangePasswordPayload = {
          email: u.email,
          old_password: oldPassword,
          new_password: newPassword,
        };
        await authApi.changePassword(payload);
        set({ user: null });
      },

      updateNames: async (firstName, lastName) => {
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
