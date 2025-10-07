import { api } from './core';
import { useUserStore } from '@/store/user';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function refreshToken() {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        await api.post('/auth/refresh');
        const me = await api.get('/auth/me');
        useUserStore.getState().setUser(me.data);
      } catch (err) {
        useUserStore.getState().logoutLocal();
        throw err;
      } finally {
        isRefreshing = false;
      }
    })();
  }
  return refreshPromise!;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (status === 401) {
      const url = originalRequest.url ?? '';
      if (url.includes('/auth/refresh')) {
        useUserStore.getState().logoutLocal();
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await refreshToken();
          return api(originalRequest);
        } catch {
          useUserStore.getState().logoutLocal();
          return Promise.reject(error);
        }
      }
    }

    if (status === 429) {
      const headers = error?.response?.headers ?? {};
      const retryAfterHeader = headers['retry-after'];
      let retryAfterMs: number | null = null;

      if (typeof retryAfterHeader === 'string') {
        const seconds = Number(retryAfterHeader);
        if (!Number.isNaN(seconds)) retryAfterMs = seconds * 1000;
        else {
          const dateMs = Date.parse(retryAfterHeader);
          if (!Number.isNaN(dateMs)) retryAfterMs = Math.max(0, dateMs - Date.now());
        }
      }

      const until = Date.now() + (retryAfterMs ?? 15000);
      useUserStore.getState().setRateLimit(until);
    }

    return Promise.reject(error);
  },
);
