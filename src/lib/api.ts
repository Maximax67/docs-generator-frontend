import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/store/user';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
});

export type ApiError = {
  detail?: string;
};

type AxiosErrorLike = {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
  message?: string;
};

type FastAPIErrorDetail = {
  msg?: string;
};

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

export function toErrorMessage(error: unknown, fallback: string = 'Сталася помилка'): string {
  if (!error) return fallback;

  if (typeof error === 'object' && error !== null) {
    const maybeAxiosError = error as AxiosErrorLike;

    const detail = maybeAxiosError.response?.data?.detail;

    if (typeof detail === 'string') return detail;

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as FastAPIErrorDetail;
      if (first && typeof first.msg === 'string') return first.msg;
    }

    if (typeof maybeAxiosError.message === 'string') return maybeAxiosError.message;
  }

  return fallback;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    try {
      const status = error?.response?.status;
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (status === 401) {
        const requestUrl = originalRequest?.url ?? '';

        if (requestUrl.includes('/auth/refresh')) {
          try {
            useUserStore.getState().logoutLocal();
          } catch { }

          return Promise.reject(error);
        }

        if (!originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await refreshToken();
            return api(originalRequest);
          } catch {
            try {
              useUserStore.getState().logoutLocal();
            } catch { }

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
          if (!Number.isNaN(seconds)) {
            retryAfterMs = seconds * 1000;
          } else {
            const dateMs = Date.parse(retryAfterHeader);
            if (!Number.isNaN(dateMs)) {
              retryAfterMs = Math.max(0, dateMs - Date.now());
            }
          }
        }

        if (retryAfterMs == null) {
          const resetEpoch = headers['x-ratelimit-reset'];
          if (typeof resetEpoch === 'string') {
            const epochSeconds = Number.parseFloat(resetEpoch);
            if (!Number.isNaN(epochSeconds)) {
              const resetAtMs = Math.round(epochSeconds * 1000);
              retryAfterMs = Math.max(0, resetAtMs - Date.now());
            }
          }
        }

        const until = Date.now() + (retryAfterMs ?? 15000);
        try {
          useUserStore.getState().setRateLimit(until);
        } catch { }
      }
    } catch { }

    return Promise.reject(error);
  },
);
