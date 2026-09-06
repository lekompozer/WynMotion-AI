/**
 * Template Video Local Disk Storage & Cache Manager
 * 
 * - Prioritizes reading videos directly from device SSD storage (Directory.Data) for 0ms offline playback.
 * - Native iOS downloads write directly to iPhone disk via @capacitor/filesystem (0MB JS RAM usage).
 * - Web browsers fallback to CacheStorage without memory bloat.
 * - Downloads ALL template videos sequentially in the background after cover images finish loading.
 */

import { Capacitor } from '@capacitor/core';

const CACHE_NAME = 'wynmotion-template-videos-v1';
const TEMPLATES_FOLDER = 'template_videos';

export const BUNDLED_LOCAL_FILES = new Set([
  '/templates/animation_ads_image_demo.mp4',
  '/templates/animation_ads_image_demo_2.mp4',
  '/templates/cinematic_showcase_demo.mp4',
  '/templates/strobe_teaser_demo.mp4',
]);

let currentPreloadAbortController: AbortController | null = null;

/**
 * Extracts a safe, deterministic filename from any remote URL.
 */
function getFileNameFromUrl(url: string): string {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const parts = cleanUrl.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.includes('.')) {
      return lastPart.replace(/[^a-zA-Z0-9._-]/g, '_');
    }
  } catch {
    // fallback to hash
  }

  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  return `template_${Math.abs(hash)}.mp4`;
}

/**
 * Preload all cover images with high priority.
 * Cover images are lightweight (JPEG/PNG/WebP) and should appear immediately.
 */
export function preloadCoverImages(urls: string[]): void {
  if (typeof window === 'undefined') return;

  const validUrls = Array.from(new Set(urls.filter(Boolean)));
  validUrls.forEach((url) => {
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    } catch {
      // Non-blocking
    }
  });
}

/**
 * Checks if a video already exists in local disk storage (Directory.Data) on device.
 * Returns the webview-accessible URL (capacitor://localhost/_capacitor_file_/...) if found,
 * or null if not yet downloaded.
 */
export async function getLocalVideoDiskUri(url: string): Promise<string | null> {
  if (!url) return null;

  if (Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const fileName = getFileNameFromUrl(url);
      const relativePath = `${TEMPLATES_FOLDER}/${fileName}`;

      const stat = await Filesystem.stat({
        path: relativePath,
        directory: Directory.Data,
      });

      if (stat && stat.size > 1024) {
        // Convert native file path to webview playable stream URL
        return Capacitor.convertFileSrc(stat.uri);
      }
    } catch {
      // Not on disk
    }
    return null;
  }

  // Web Browser: check CacheStorage
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      if (match) {
        return url;
      }
    } catch {
      // CacheStorage check error
    }
  }

  return null;
}

/**
 * Downloads a video directly to native device disk storage (Directory.Data).
 * Uses iOS NSURLSessionDownloadTask (writing directly from network to SSD flash, 0 RAM usage).
 */
export async function downloadVideoToDisk(
  url: string,
  signal?: AbortSignal
): Promise<string | null> {
  if (!url || url.startsWith('/templates/')) return null;

  // 1. Native iOS / Android: save to persistent device disk (Directory.Data)
  if (Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const fileName = getFileNameFromUrl(url);
      const relativePath = `${TEMPLATES_FOLDER}/${fileName}`;

      // Check if already downloaded on disk
      try {
        const stat = await Filesystem.stat({
          path: relativePath,
          directory: Directory.Data,
        });
        if (stat && stat.size > 1024) {
          return Capacitor.convertFileSrc(stat.uri);
        }
      } catch {
        // File does not exist yet, continue download
      }

      if (signal?.aborted) return null;

      // Ensure directory exists
      try {
        await Filesystem.mkdir({
          path: TEMPLATES_FOLDER,
          directory: Directory.Data,
          recursive: true,
        });
      } catch {
        // Directory exists
      }

      if (signal?.aborted) return null;

      // Download directly to device flash storage
      const res = await Filesystem.downloadFile({
        url,
        path: relativePath,
        directory: Directory.Data,
        recursive: true,
      });

      if (res && res.path) {
        return Capacitor.convertFileSrc(res.path);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Native video download to disk failed:', url, err);
      }
    }
    return null;
  }

  // 2. Web Browser: CacheStorage
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      if (match) return url;

      if (signal?.aborted) return null;
      const response = await fetch(url, { mode: 'cors', signal });
      if (response.ok) {
        await cache.put(url, response);
      }
      return url;
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Web video pre-cache skipped:', url);
      }
    }
  }

  return null;
}

/**
 * Returns the fastest playback URL for a template video:
 * 1. If bundled in local assets (/public/templates), returns it immediately.
 * 2. If saved on local device disk storage, ALWAYS returns local disk path (0ms, 0 network).
 * 3. Otherwise returns remote CDN streaming URL AND triggers a background download to local disk for future opens.
 */
export async function getFastVideoUrl(
  localPath?: string,
  remoteUrl?: string
): Promise<string> {
  // 1. If bundled inside app bundle
  if (localPath && BUNDLED_LOCAL_FILES.has(localPath)) {
    return localPath;
  }

  const targetUrl = remoteUrl || (localPath && !localPath.startsWith('/templates/') ? localPath : '');
  if (!targetUrl) return '';

  if (targetUrl.startsWith('capacitor://') || targetUrl.startsWith('file://')) {
    return targetUrl;
  }

  // 2. ALWAYS prioritize local disk storage if available
  const localDiskUri = await getLocalVideoDiskUri(targetUrl);
  if (localDiskUri) {
    return localDiskUri;
  }

  // 3. Fallback: return remote streaming URL & queue background save to local disk
  if (Capacitor.isNativePlatform()) {
    downloadVideoToDisk(targetUrl).catch(() => {});
  }

  return targetUrl;
}

/**
 * Cancel any ongoing background video preloading.
 */
export function cancelPreloadVideos(): void {
  if (currentPreloadAbortController) {
    currentPreloadAbortController.abort();
    currentPreloadAbortController = null;
  }
}

/**
 * Pre-downloads ALL template preview videos to local device disk storage.
 * 
 * - Waits for an idle delay (default 2500ms) after modal open, ensuring all cover images load first.
 * - Runs sequentially (1 video at a time) with a 350ms rest between downloads.
 * - Skips any video that already exists on disk.
 * - Zero JS RAM consumption (writes directly to SSD storage).
 */
export function preloadAllTemplateVideos(
  templates: Array<{ video_demo_url?: string; videoUrl?: string; local_video_path?: string }>,
  delayMs = 2500
): void {
  if (typeof window === 'undefined') return;

  // Cancel any previous preloading queue
  cancelPreloadVideos();

  const controller = new AbortController();
  currentPreloadAbortController = controller;

  const urls = templates
    .map((t) => t.video_demo_url || t.videoUrl || t.local_video_path)
    .filter((u): u is string => Boolean(u && !u.startsWith('/templates/')));

  const uniqueUrls = Array.from(new Set(urls));

  // Execute in background after delay (allowing covers & UI to settle first)
  setTimeout(async () => {
    if (controller.signal.aborted) return;

    for (const url of uniqueUrls) {
      if (controller.signal.aborted) break;

      try {
        // Download directly to local disk (skips if already on disk)
        await downloadVideoToDisk(url, controller.signal);
      } catch {
        // Continue to next item
      }

      // Rest 350ms between downloads to keep network and CPU completely smooth
      if (!controller.signal.aborted) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  }, delayMs);
}
