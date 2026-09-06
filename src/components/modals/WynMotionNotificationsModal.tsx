'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Trash2,
  Crown,
  Film,
  Mic,
  Sparkles,
  ExternalLink,
  Clock,
  Inbox,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import {
  wynmotionNotificationManager,
  WynMotionNotificationItem,
} from '@/services/wynmotionNotificationManager';

interface WynMotionNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WynMotionNotificationsModal: React.FC<WynMotionNotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDark, isVietnamese, t } = useApp();

  const [notifications, setNotifications] = useState<WynMotionNotificationItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setNotifications(wynmotionNotificationManager.getNotifications());
    const unsubscribe = wynmotionNotificationManager.subscribe((items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.max(0, Date.now() - timestamp);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('Vừa xong', 'Just now');
    if (mins < 60) return isVietnamese ? `${mins} phút trước` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return isVietnamese ? `${hours} giờ trước` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return isVietnamese ? `${days} ngày trước` : `${days}d ago`;
  };

  const getIconForType = (type: WynMotionNotificationItem['type']) => {
    switch (type) {
      case 'upgrade':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
            <Crown className="w-4 h-4" />
          </div>
        );
      case 'export_video':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Film className="w-4 h-4" />
          </div>
        );
      case 'generate_audio':
        return (
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-sm">
            <Mic className="w-4 h-4" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Center Modal / Mobile Bottom Sheet */}
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-lg max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col transition-all overflow-hidden animate-in zoom-in-95 duration-200 ${
            isDark ? 'border-white/10 bg-[#0F1424] text-slate-100' : 'border-gray-200 bg-white text-gray-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF2D55] to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight">
                    {t('Thông Báo Studio', 'Studio Notifications')}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF2D55] text-white">
                      {unreadCount} {t('mới', 'new')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  {t('Lịch sử nạp điểm, nâng cấp VIP & xuất video MP4', 'Points, VIP upgrade & MP4 export events')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors ${
                isDark
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                  : 'border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          {notifications.length > 0 && (
            <div className={`flex items-center justify-between px-4 py-2 text-xs border-b ${
              isDark ? 'border-white/5 bg-black/20 text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-600'
            }`}>
              <button
                type="button"
                onClick={() => wynmotionNotificationManager.markAllAsRead()}
                className="flex items-center gap-1.5 font-bold hover:text-cyan-400 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t('Đánh dấu đã đọc', 'Mark all read')}</span>
              </button>

              <button
                type="button"
                onClick={() => wynmotionNotificationManager.clearAll()}
                className="flex items-center gap-1.5 font-bold hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('Xóa tất cả', 'Clear all')}</span>
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-transparent">
            {notifications.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-300">
                  {t('Không có thông báo nào', 'No notifications yet')}
                </p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  {t(
                    'Các thông báo xuất video MP4, nạp điểm hoặc nâng cấp VIP sẽ xuất hiện tại đây.',
                    'Notifications for MP4 video export, point top-ups, and VIP upgrades will appear here.'
                  )}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => wynmotionNotificationManager.markAsRead(item.id)}
                  className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.isRead
                      ? isDark
                        ? 'border-white/5 bg-white/[0.02] opacity-75 hover:opacity-100 hover:bg-white/[0.04]'
                        : 'border-gray-200 bg-gray-50/60 opacity-80 hover:opacity-100'
                      : isDark
                      ? 'border-cyan-500/30 bg-cyan-500/[0.06] shadow-sm shadow-cyan-500/10'
                      : 'border-cyan-200 bg-cyan-50/80 shadow-sm'
                  }`}
                >
                  {getIconForType(item.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black truncate">
                        {isVietnamese ? item.titleVi : item.titleEn}
                      </h4>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0 font-medium">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {isVietnamese ? item.messageVi : item.messageEn}
                    </p>

                    {item.link && (
                      <a
                        href={item.link}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline mt-1.5"
                      >
                        <span>{t('Xem chi tiết', 'View details')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Delete Item Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      wynmotionNotificationManager.deleteNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-400 transition-opacity"
                    title={t('Xóa', 'Delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
