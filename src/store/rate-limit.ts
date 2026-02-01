'use client';

import { create } from 'zustand';
import { RateLimitState } from '@/types/rate-limit';

export const useRateLimitStore = create<RateLimitState>((set) => ({
  rateLimitedUntil: null,
  setRateLimit: (until: number) => set({ rateLimitedUntil: until }),
  clearRateLimit: () => set({ rateLimitedUntil: null }),
}));
