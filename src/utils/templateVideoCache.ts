/**
 * Template Video Local Cache Manager
 * Uses browser CacheStorage (or IndexedDB/Blob URL fallback) to download and store
 * all template preview videos on local device storage so they play instantly (0ms delay).
 */

const CACHE_NAME = 'wynmotion-template-videos-v1';
const inMemoryBlobUrls = new Map<string, string>();

/**
 * Returns a fast local playback URL for a template video:
 * 1. If it's a bundled asset (e.g. /templates/xxx.mp4), return it directly (loaded from app disk).
 * 2. If it's cached in CacheStorage, return a cached Blob URL.
 * 3. Otherwise, return the original URL and trigger background caching.
 */
export async function getFastVideoUrl(
  localPath?: string,
  remoteUrl?: string
): Promise<string> {
  // 1. If bundled local path exists and starts with /templates, it's inside the app bundle
  if (localPath && localPath.startsWith('/templates/')) {
    return localPath;
  }

  const targetUrl = remoteUrl || localPath;
  if (!targetUrl) return '';

  // If already bundled /templates path
  if (targetUrl.startsWith('/templates/') || targetUrl.startsWith('capacitor://') || targetUrl.startsWith('file://')) {
    return targetUrl;
  }

  // Check in-memory object URL cache
  if (inMemoryBlobUrls.has(targetUrl)) {
    return inMemoryBlobUrls.get(targetUrl)!;
  }

  // Check CacheStorage
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(targetUrl);
      if (match) {
        const blob = await match.blob();
        const blobUrl = URL.createObjectURL(blob);
        inMemoryBlobUrls.set(targetUrl, blobUrl);
        return blobUrl;
      }

      // If not cached yet, download and cache in background
      cacheVideoInBackground(targetUrl);
    } catch (e) {
      console.warn('CacheStorage check failed:', e);
    }
  }

  return targetUrl;
}

/**
 * Downloads and caches a video in the background without blocking the UI.
 */
export async function cacheVideoInBackground(url: string): Promise<void> {
  if (!url || url.startsWith('/templates/') || !('caches' in window)) return;

  try {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(url);
    if (match) return; // already cached

    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      await cache.put(url, response.clone());
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      inMemoryBlobUrls.set(url, blobUrl);
    }
  } catch (err) {
    // Non-blocking catch
    console.warn('Failed to pre-cache video:', url, err);
  }
}

/**
 * Pre-cache an array of template videos on app startup or gallery open.
 */
export async function preloadAllTemplateVideos(
  templates: Array<{ video_demo_url?: string; videoUrl?: string; local_video_path?: string }>
): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;

  const urls = templates
    .map((t) => t.video_demo_url || t.videoUrl || t.local_video_path)
    .filter((u): u is string => Boolean(u && !u.startsWith('/templates/')));

  const uniqueUrls = Array.from(new Set(urls));
  for (const url of uniqueUrls) {
    cacheVideoInBackground(url);
  }
}
