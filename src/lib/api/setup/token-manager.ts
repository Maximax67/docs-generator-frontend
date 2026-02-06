
const ACCESS_TOKEN_LIFETIME_MINUTES =
  parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_LIFETIME_MINUTES || '10', 10);

const ACCESS_TOKEN_LIFETIME_MS = ACCESS_TOKEN_LIFETIME_MINUTES * 60 * 1000;
const REFRESH_BUFFER_MS = 30 * 1000; // Refresh 30 seconds before expiration

class TokenManager {
  private lastRefreshTime: number | null = null;
  private storageKey = 'token-last-refresh';

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.lastRefreshTime = parseInt(stored, 10);
      }
    }
  }

  markRefreshed(): void {
    this.lastRefreshTime = Date.now();
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, this.lastRefreshTime.toString());
    }
  }

  clear(): void {
    this.lastRefreshTime = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  isTokenExpired(): boolean {
    if (!this.lastRefreshTime) {
      return true;
    }

    const now = Date.now();
    const timeSinceRefresh = now - this.lastRefreshTime;

    return timeSinceRefresh >= (ACCESS_TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS);
  }

  shouldRefreshOnBootstrap(): boolean {
    if (!this.lastRefreshTime) {
      return true;
    }

    const now = Date.now();
    const timeSinceRefresh = now - this.lastRefreshTime;

    return timeSinceRefresh >= (ACCESS_TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS);
  }

  getTimeUntilExpiration(): number {
    if (!this.lastRefreshTime) {
      return 0;
    }

    const now = Date.now();
    const timeSinceRefresh = now - this.lastRefreshTime;
    const timeRemaining = ACCESS_TOKEN_LIFETIME_MS - timeSinceRefresh;

    return Math.max(0, timeRemaining);
  }

  getTokenLifetime(): number {
    return ACCESS_TOKEN_LIFETIME_MS;
  }
}

export const tokenManager = new TokenManager();
