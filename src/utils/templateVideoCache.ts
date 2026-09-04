/**
 * Template Video Local Cache Manager
 * Uses browser CacheStorage (or IndexedDB/Blob URL fallback) to download and store
 * all template preview videos on local device storage so they play instantly (0ms delay).
 */

const CACHE_NAME = 'wynmotion-template-videos-v1';
const inMemoryBlobUrls = new Map<string, string>();

export const BUNDLED_LOCAL_FILES = new Set([
  '/templates/animation_ads_image_demo.mp4',
  '/templates/animation_ads_image_demo_2.mp4',
  '/templates/cinematic_showcase_demo.mp4',
  '/templates/strobe_teaser_demo.mp4',
]);

/**
 * Returns a fast local playback URL for a template video:
 * 1. If it's an actual bundled asset inside /public/templates, return it directly (loaded from local bundle).
 * 2. Otherwise return the remote HTTPS streaming URL (direct HTTP 206 byte-range streaming for WebKit/iOS).
 */
export async function getFastVideoUrl(
  localPath?: string,
  remoteUrl?: string
): Promise<string> {
  // 1. If actually bundled in app disk
  if (localPath && BUNDLED_LOCAL_FILES.has(localPath)) {
    return localPath;
  }

  // 2. Otherwise prefer remote URL (or fallback)
  const targetUrl = remoteUrl || (localPath && !localPath.startsWith('/templates/') ? localPath : '');
  if (!targetUrl) return '';

  if (targetUrl.startsWith('capacitor://') || targetUrl.startsWith('file://')) {
    return targetUrl;
  }

  // NOTE: On iOS Safari and WKWebView (Capacitor), HTML5 <video> requires HTTP 206 Partial Content
  // (byte range requests) to decode MP4 containers. Converting MP4 blobs to blob: URLs breaks
  // byte-range seeking in WebKit, causing videos to freeze on the poster frame.
  // Returning the direct HTTPS CDN URL ensures smooth, hardware-accelerated playback.
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
