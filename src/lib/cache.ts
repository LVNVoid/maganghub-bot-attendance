import { unstable_cache, updateTag, revalidateTag } from "next/cache";

/**
 * Invalidate Next.js cache tags safely across Next.js 15 & 16.
 * In Next.js 16 Server Actions, updateTag(tag) provides immediate read-your-own-writes.
 */
export function invalidateCacheTag(tag: string): void {
  try {
    updateTag(tag);
  } catch {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // Ignore if outside request context
    }
  }
}

/**
 * In-memory TTL Cache (for external API responses such as GitHub commits & token checks).
 */
export class SimpleMemoryCache {
  private cache = new Map<string, { value: any; expiresAt: number }>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const memoryCache = new SimpleMemoryCache();

/**
 * Safe wrapper for Next.js unstable_cache that gracefully degrades to direct execution
 * if called outside of a Next.js server context (e.g. standalone scripts or tests).
 */
export function safeCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options?: { tags?: string[]; revalidate?: number | false }
): T {
  const cachedFn = unstable_cache(fn, keyParts, options);

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await cachedFn(...args);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("incrementalCache missing") ||
        msg.includes("Invariant") ||
        msg.includes("Cannot read properties of undefined")
      ) {
        return await fn(...args);
      }
      throw err;
    }
  }) as T;
}
