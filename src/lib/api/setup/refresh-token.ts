import { useUserStore } from '@/store/user';
import { bootstrapApi } from '../core';
import { tokenManager } from './token-manager';
import { isAxiosError } from '@/utils/is-axios-error';

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export async function refreshToken() {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        await bootstrapApi.post('/auth/refresh');
        const me = await bootstrapApi.get('/auth/me');
        useUserStore.getState().setUser(me.data);
        tokenManager.markRefreshed();
      } catch (err) {
        if (isAxiosError(err) && err.status === 401) {
          useUserStore.getState().logoutLocal();
        }
        throw err;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise!;
}
