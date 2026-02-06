import { api } from '../core';
import { useUserStore } from '@/store/user';
import { useRateLimitStore } from '@/store/rate-limit';
import { refreshToken } from './refresh-token';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';


api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors
    if (status === 401) {
      const url = originalRequest.url ?? '';

      // If the refresh endpoint itself fails with 401, logout
      if (url.includes('/auth/refresh')) {
        useUserStore.getState().logoutLocal();
        return Promise.reject(error);
      }

      // Try to refresh the token once
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await refreshToken();
          return api(originalRequest);
        } catch {
          return Promise.reject(error);
        }
      }

      // If retry already attempted, logout
      useUserStore.getState().logoutLocal();
      return Promise.reject(error);
    }

    if (status === 429) {
      const headers = error?.response?.headers ?? {};
      const retryAfterHeader = headers['retry-after'];
      let retryAfterMs: number | null = null;

      if (typeof retryAfterHeader === 'string') {
        const seconds = Number(retryAfterHeader);
        if (!Number.isNaN(seconds)) {
          retryAfterMs = seconds * 1000;
        } else {
          const dateMs = Date.parse(retryAfterHeader);
          if (!Number.isNaN(dateMs)) {
            retryAfterMs = Math.max(0, dateMs - Date.now());
          }
        }
      }

      const until = Date.now() + (retryAfterMs ?? 15000);
      useRateLimitStore.getState().setRateLimit(until);
    }

    return Promise.reject(error);
  },
);
