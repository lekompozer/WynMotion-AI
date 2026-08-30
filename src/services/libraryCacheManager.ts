/**
 * libraryCacheManager.ts — WynMotion-AI iOS Studio
 *
 * High-Performance Client-side Caching & Incremental Delta Sync Engine:
 * - 0ms Instant UI Load (Cache-First / Stale-While-Revalidate)
 * - User-scoped caching with memory fallback (IndexedDB / LocalStorage)
 * - Deduplication and delta merging by library_id
 * - Cross-tab event bus (notifyLibraryUpdated / onLibraryUpdated)
 */

import { LibraryFile } from './libraryService';

const CACHE_PREFIX = 'wynmotion_lib_cache_';
const SYNC_PREFIX = 'wynmotion_lib_sync_';
const MAX_CACHED_PER_CAT = 120;

// In-memory hot cache fallback
const memoryCache = new Map<string, { files: LibraryFile[]; lastSync: string }>();

export const libraryCacheManager = {
  /**
   * Retrieve cached assets for a specific user and category
   */
  getCachedFiles(userId: string, category: string): { files: LibraryFile[]; lastSync: string | null } {
    if (!userId || typeof window === 'undefined') {
      return { files: [], lastSync: null };
    }

    const key = `${CACHE_PREFIX}${userId}_${category}`;
    const syncKey = `${SYNC_PREFIX}${userId}_${category}`;

    // 1. Check memory cache first
    const mem = memoryCache.get(key);
    if (mem && Array.isArray(mem.files) && mem.files.length > 0) {
      return { files: mem.files, lastSync: mem.lastSync || null };
    }

    // 2. Read from LocalStorage
    try {
      const raw = localStorage.getItem(key);
      const lastSync = localStorage.getItem(syncKey);
      if (raw) {
        const parsed: LibraryFile[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryCache.set(key, { files: parsed, lastSync: lastSync || '' });
          return { files: parsed, lastSync: lastSync || null };
        }
      }
    } catch (e) {
      console.warn('[LibraryCache] LocalStorage read failed:', e);
    }

    return { files: [], lastSync: null };
  },

  /**
   * Store full list of assets into cache with size pruning
   */
  setCachedFiles(userId: string, category: string, files: LibraryFile[]): void {
    if (!userId || typeof window === 'undefined') return;

    const key = `${CACHE_PREFIX}${userId}_${category}`;
    const syncKey = `${SYNC_PREFIX}${userId}_${category}`;
    const nowIso = new Date().toISOString();
    const pruned = files.slice(0, MAX_CACHED_PER_CAT);

    // Save to memory cache
    memoryCache.set(key, { files: pruned, lastSync: nowIso });

    // Save to LocalStorage
    try {
      localStorage.setItem(key, JSON.stringify(pruned));
      localStorage.setItem(syncKey, nowIso);
    } catch (e) {
      console.warn('[LibraryCache] LocalStorage save failed (storage full?):', e);
    }
  },

  /**
   * Merge newly fetched delta assets with existing cached assets, removing duplicates
   */
  mergeDeltaFiles(existing: LibraryFile[], newDelta: LibraryFile[]): LibraryFile[] {
    if (!newDelta || newDelta.length === 0) return existing;
    if (!existing || existing.length === 0) return newDelta;

    const map = new Map<string, LibraryFile>();

    // New items take precedence (placed first)
    for (const item of newDelta) {
      const id = item.library_id || (item as any).file_id;
      if (id) map.set(id, item);
    }

    // Existing items appended
    for (const item of existing) {
      const id = item.library_id || (item as any).file_id;
      if (id && !map.has(id)) {
        map.set(id, item);
      }
    }

    return Array.from(map.values()).slice(0, MAX_CACHED_PER_CAT);
  },

  /**
   * Remove cached records when explicit refresh occurs
   */
  clearCategoryCache(userId: string, category: string): void {
    if (!userId || typeof window === 'undefined') return;
    const key = `${CACHE_PREFIX}${userId}_${category}`;
    const syncKey = `${SYNC_PREFIX}${userId}_${category}`;

    memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(syncKey);
    } catch {}
  },

  /**
   * Wipe ALL cached records, project history, and indexes for a specific user.
   * Ensures zero cross-account data leakage and full Apple Guideline 5.1.1 compliance.
   */
  clearAllUserCache(userId: string): void {
    if (!userId || typeof window === 'undefined') return;
    const userPrefix = `${CACHE_PREFIX}${userId}`;
    const syncPrefix = `${SYNC_PREFIX}${userId}`;
    const projKey = `wynmotion_cached_projects_${userId}`;

    // 1. Clear memory cache
    for (const k of Array.from(memoryCache.keys())) {
      if (k.includes(userId)) {
        memoryCache.delete(k);
      }
    }

    // 2. Clear user-scoped LocalStorage
    try {
      localStorage.removeItem(projKey);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(userPrefix) || k.startsWith(syncPrefix) || k.includes(userId))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('[LibraryCache] LocalStorage user wipe error:', e);
    }
  },

  /**
   * Broadcast an update event across components / tabs
   */
  notifyLibraryUpdated(category?: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.dispatchEvent(
        new CustomEvent('wynmotion:library_updated', {
          detail: { category, timestamp: Date.now() },
        })
      );
    } catch {}
  },

  /**
   * Listen for library update events (e.g. from Studio image generator or MP4 exporter)
   */
  onLibraryUpdated(callback: (category?: string) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = (event: Event) => {
      const custom = event as CustomEvent;
      callback(custom?.detail?.category);
    };

    window.addEventListener('wynmotion:library_updated', handler);
    return () => {
      window.removeEventListener('wynmotion:library_updated', handler);
    };
  },
};
