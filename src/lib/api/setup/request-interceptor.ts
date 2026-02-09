import { bootstrapReady, isBootstrapping } from './bootstrap';
import { api } from '../core';
import { tokenManager } from './token-manager';
import { useUserStore } from '@/store/user';
import { refreshToken } from './refresh-token';

api.interceptors.request.use(async (config) => {
  if (isBootstrapping()) {
    await bootstrapReady;
  }

  const url = config.url ?? '';
  if (
    url.includes('/auth/refresh') ||
    url.includes('/auth/login') ||
    url.includes('/auth/register')
  ) {
    return config;
  }

  const user = useUserStore.getState().user;
  if (!user) {
    return config;
  }

  // Proactively refresh token if it's expired or about to expire
  if (tokenManager.isTokenExpired()) {
    try {
      await refreshToken();
    } catch (error) {
      console.error('Proactive token refresh failed:', error);
    }
  }

  return config;
});
