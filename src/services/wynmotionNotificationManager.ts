/**
 * wynmotionNotificationManager.ts
 * Manages in-app notifications for WynMotion AI Studio (Upgrade, Export MP4, Audio generation, System)
 * Stored locally in localStorage with event subscription for real-time reactivity.
 */

export type WynMotionNotificationType = 'upgrade' | 'export_video' | 'generate_audio' | 'system';

export interface WynMotionNotificationItem {
  id: string;
  type: WynMotionNotificationType;
  titleVi: string;
  titleEn: string;
  messageVi: string;
  messageEn: string;
  timestamp: number;
  isRead: boolean;
  link?: string;
  data?: Record<string, any>;
}

const STORAGE_KEY = 'wynmotion_notifications_v1';
const EVENT_NAME = 'wynmotion:notifications-updated';

const DEFAULT_NOTIFICATIONS: WynMotionNotificationItem[] = [
  {
    id: 'welcome_studio',
    type: 'system',
    titleVi: '🎁 Chào mừng đến với WynMotion AI Studio!',
    titleEn: '🎁 Welcome to WynMotion AI Studio!',
    messageVi: 'Tài khoản của bạn đã sẵn sàng trải nghiệm tạo video hoạt họa AI, chuyển động đa phong cách & giọng đọc 48kHz.',
    messageEn: 'Your account is ready to create AI animated videos, multi-style motion & 48kHz studio voices.',
    timestamp: Date.now() - 3600000,
    isRead: false,
  },
];

class WynMotionNotificationManager {
  private getStorage(): WynMotionNotificationItem[] {
    if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
        return DEFAULT_NOTIFICATIONS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  }

  private setStorage(items: WynMotionNotificationItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
    } catch (err) {
      console.warn('Could not save notifications to localStorage:', err);
    }
  }

  public getNotifications(): WynMotionNotificationItem[] {
    return this.getStorage().sort((a, b) => b.timestamp - a.timestamp);
  }

  public getUnreadCount(): number {
    const list = this.getStorage();
    return list.filter((item) => !item.isRead).length;
  }

  public addNotification(
    item: Omit<WynMotionNotificationItem, 'id' | 'timestamp' | 'isRead'>
  ): WynMotionNotificationItem {
    const newItem: WynMotionNotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      isRead: false,
    };
    const current = this.getStorage();
    // Keep max 50 recent notifications
    const updated = [newItem, ...current].slice(0, 50);
    this.setStorage(updated);
    return newItem;
  }

  public markAsRead(id: string): void {
    const current = this.getStorage();
    const updated = current.map((item) => (item.id === id ? { ...item, isRead: true } : item));
    this.setStorage(updated);
  }

  public markAllAsRead(): void {
    const current = this.getStorage();
    const updated = current.map((item) => ({ ...item, isRead: true }));
    this.setStorage(updated);
  }

  public deleteNotification(id: string): void {
    const current = this.getStorage();
    const updated = current.filter((item) => item.id !== id);
    this.setStorage(updated);
  }

  public clearAll(): void {
    this.setStorage([]);
  }

  public subscribe(listener: (items: WynMotionNotificationItem[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<WynMotionNotificationItem[]>;
      listener(customEvent.detail || this.getNotifications());
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
    };
  }
}

export const wynmotionNotificationManager = new WynMotionNotificationManager();
