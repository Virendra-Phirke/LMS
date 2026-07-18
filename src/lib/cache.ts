import { unstable_cache } from "next/cache";

/**
 * A type-safe caching utility wrapper around Next.js `unstable_cache`.
 * It caches the results of database queries or heavy computations.
 * 
 * @param cb The async callback to execute and cache
 * @param keyParts Unique cache keys (e.g. ['books', 'all'])
 * @param options Options for revalidation time and tags
 */
export async function withCache<T>(
  cb: () => Promise<T>,
  keyParts: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  }
): Promise<T> {
  // We use unstable_cache to serve data instantly from the Next.js cache.
  const cachedFn = unstable_cache(cb, keyParts, options);
  return cachedFn();
}
