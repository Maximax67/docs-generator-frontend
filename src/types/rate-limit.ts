export interface RateLimitState {
  rateLimitedUntil: number | null;
  setRateLimit: (until: number) => void;
  clearRateLimit: () => void;
}
