/**
 * Library Files Service — WynMotion-AI iOS App
 * Mirrors /wordai/src/services/libraryService.ts
 * Handles all Cloud R2 Library APIs (Type 3 files)
 * Categories: Images, Videos, Audio
 */

import { wordaiAuth } from '@/lib/wordai-firebase';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://ai.wordai.pro';

export interface LibraryFile {
  library_id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  category: 'images' | 'videos' | 'audio';
  description?: string;
  tags: string[];
  metadata: Record<string, any>;
  file_url: string;
  is_deleted: boolean;
  uploaded_at: string;
  updated_at: string;
}

export interface LibraryStats {
  total_files: number;
  total_bytes: number;
  by_category: {
    [key: string]: {
      count: number;
      size_bytes: number;
    };
  };
}

async function getAuthToken(): Promise<string | null> {
  try {
    const user = wordaiAuth?.currentUser;
    if (user) {
      return await user.getIdToken();
    }
  } catch {
    // Guest fallback
  }
  return null;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Upload file to Cloud R2 Library
 * Category is auto-detected based on file MIME type
 */
export async function uploadLibraryFile(
  file: File,
  description?: string,
  tags?: string[]
): Promise<LibraryFile> {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);
  if (tags && tags.length > 0) formData.append('tags', tags.join(','));

  const response = await fetch(`${API_BASE_URL}/api/library/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || 'Không thể tải file lên thư viện');
  }

  return response.json();
}

/**
 * List library files with filters and optional delta since timestamp
 */
export async function listLibraryFiles(
  category?: 'images' | 'videos' | 'audio',
  tags?: string[],
  limit = 100,
  offset = 0,
  since?: string
): Promise<LibraryFile[]> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (tags && tags.length > 0) params.append('tags', tags.join(','));
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  if (since) params.append('since', since);

  const response = await fetch(`${API_BASE_URL}/api/library/files?${params}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách thư viện');
  }

  return response.json();
}

/**
 * Get single library file by ID
 */
export async function getLibraryFile(libraryId: string): Promise<LibraryFile> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/library/files/${libraryId}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Không tìm thấy file trong thư viện');
  }
  return response.json();
}

/**
 * Move file to trash (soft delete)
 */
export async function moveToTrash(libraryId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/library/files/${libraryId}/trash`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
    throw new Error(error.detail || 'Không thể xóa file');
  }
}

/**
 * Get library storage stats
 */
export async function getLibraryStats(): Promise<LibraryStats> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/library/stats`, { headers });
  if (!response.ok) {
    return { total_files: 0, total_bytes: 0, by_category: {} };
  }
  return response.json();
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
