import { bootstrapReady, isBootstrapping } from './bootstrap';
import { api } from './core';

api.interceptors.request.use(async (config) => {
  if (isBootstrapping()) {
    await bootstrapReady;
  }

  return config;
});
