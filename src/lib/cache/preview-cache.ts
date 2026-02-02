/**
 * Document Preview Cache
 *
 * Manages caching of document previews with automatic expiration
 */

export interface CachedPreview {
  id: string;
  url: string;
  blob?: Blob;
  loading: boolean;
  error?: string;
  timestamp: number;
}

export class PreviewCache {
  private cache: Map<string, CachedPreview> = new Map();
  private readonly cacheDuration: number;

  constructor(cacheDurationMs = 10 * 60 * 1000) {
    this.cacheDuration = cacheDurationMs;
  }

  /**
   * Check if a preview is cached and still valid
   */
  has(documentId: string): boolean {
    const cached = this.cache.get(documentId);
    if (!cached) return false;

    const now = Date.now();
    const isExpired = now - cached.timestamp > this.cacheDuration;
    const isValid = cached.url && !cached.error && !isExpired;

    return !!isValid;
  }

  /**
   * Get a cached preview
   */
  get(documentId: string): CachedPreview | undefined {
    return this.cache.get(documentId);
  }

  /**
   * Set a preview in the cache
   */
  set(documentId: string, preview: CachedPreview): void {
    this.cache.set(documentId, preview);
  }

  /**
   * Remove a preview from the cache
   */
  delete(documentId: string): void {
    this.cache.delete(documentId);
  }

  /**
   * Clear all cached previews
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get all cached previews as a record
   */
  toRecord(): Record<string, CachedPreview> {
    const record: Record<string, CachedPreview> = {};
    this.cache.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  /**
   * Create a loading state preview
   */
  createLoadingPreview(documentId: string): CachedPreview {
    return {
      id: documentId,
      url: '',
      loading: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Create an error state preview
   */
  createErrorPreview(documentId: string, error: string): CachedPreview {
    return {
      id: documentId,
      url: '',
      loading: false,
      error,
      timestamp: Date.now(),
    };
  }

  /**
   * Create a success state preview
   */
  createSuccessPreview(documentId: string, url: string, blob?: Blob): CachedPreview {
    return {
      id: documentId,
      url,
      blob,
      loading: false,
      timestamp: Date.now(),
    };
  }
}
