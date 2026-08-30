'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  userEmail,
  onClose,
  onConfirmDelete,
}) => {
  const { isDark, isVietnamese, t } = useApp();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || typeof window === 'undefined') return null;

  const isEmailMatched =
    confirmEmail.trim().toLowerCase() === (userEmail || '').trim().toLowerCase() &&
    userEmail.trim().length > 0;

  const handleDelete = async () => {
    if (!isEmailMatched || isDeleting) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await onConfirmDelete();
      onClose();
    } catch (err: any) {
      console.error('[DeleteAccountModal] Error deleting account:', err);
      setErrorMessage(
        err?.message ||
          t(
            'Xóa tài khoản thất bại. Vui lòng thử lại sau.',
            'Failed to delete account. Please try again later.'
          )
      );
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#0E111A] border-red-500/30 text-white shadow-red-950/30'
            : 'bg-white border-red-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDark ? 'border-red-500/20 bg-red-950/20' : 'border-red-100 bg-red-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-red-500">
                {t('Xóa Tài Khoản Vĩnh Viễn', 'Delete Account Permanently')}
              </h2>
              <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('Apple Guideline 5.1.1 Compliance', 'Apple Guideline 5.1.1 Compliance')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className={`p-2 rounded-xl transition-all disabled:opacity-50 ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Danger Alert Box */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              isDark
                ? 'bg-red-950/30 border-red-500/40 text-red-200'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>{t('Hành động này không thể hoàn tác!', 'This action cannot be undone!')}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {t(
                'Tất cả dữ liệu liên kết với tài khoản của bạn sẽ bị xóa vĩnh viễn trên máy chủ và thiết bị này, bao gồm: Lịch sử dự án hoạt họa, video clip đã xuất, hình ảnh AI, file âm thanh thuyết minh và điểm số AI.',
                'All data associated with your account will be permanently deleted from the cloud and this local device, including: Motion projects, exported video clips, AI images, voice recordings, and AI points.'
              )}
            </p>
          </div>

          {/* Email Confirmation Input */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('Nhập email của bạn để xác nhận:', 'Enter your email to confirm:')}
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={userEmail}
              disabled={isDeleting}
              autoCapitalize="none"
              autoCorrect="off"
              className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                isDark
                  ? 'bg-[#121522] border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              }`}
            />
          </div>

          {/* Error message */}
          {errorMessage && (
            <p className="text-xs text-red-500 font-bold animate-in fade-in">
              ❌ {errorMessage}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 px-5 border-t flex items-center justify-end gap-2.5 ${
            isDark ? 'border-white/10 bg-black/20' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isDark
                ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t('Hủy Bỏ', 'Cancel')}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!isEmailMatched || isDeleting}
            className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-lg shadow-red-500/25 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('Đang Xóa Dữ Liệu...', 'Deleting Data...')}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('Xóa Vĩnh Viễn', 'Delete Permanently')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
