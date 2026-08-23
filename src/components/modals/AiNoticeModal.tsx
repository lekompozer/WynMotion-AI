'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Film,
  Mic,
  Image as ImageIcon,
  HardDrive,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface AiNoticeModalProps {
  onClose?: () => void;
}

export const AiNoticeModal: React.FC<AiNoticeModalProps> = ({ onClose }) => {
  const { isVietnamese, isDark, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const accepted = localStorage.getItem('wynmotion_ai_permissions_accepted');
        if (!accepted) {
          setIsOpen(true);
        }
      }
    } catch (e) {
      console.warn('Could not read permission status:', e);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('wynmotion_ai_permissions_accepted', 'true');
    } catch (e) {}
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl border animate-in zoom-in-95 duration-200 space-y-5 ${
          isDark
            ? 'bg-gradient-to-b from-[#161d31] via-[#101526] to-[#0d1222] border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800/60 pb-3.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-md">
            <Sparkles className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight leading-tight">
              {t('Thông Báo Tính Năng AI & Quyền Ứng Dụng', 'AI Features & Permissions Notice')}
            </h3>
            <p className="text-[11px] text-cyan-400 font-semibold mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('Chuẩn Bảo Mật & Quyền Riêng Tư Apple', 'Apple Privacy & Safety Standards')}</span>
            </p>
          </div>
        </div>

        {/* Content list */}
        <div className="space-y-3 text-xs leading-relaxed max-h-[50vh] overflow-y-auto pr-1">
          {/* Item 1: Generative AI */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 flex-shrink-0 mt-0.5">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">
                {t('Sáng Tạo Nội Dung Trí Tuệ Nhân Tạo (AI)', 'Generative AI Creation')}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t(
                  'WynMotion sử dụng AI tạo sinh để hỗ trợ soạn kịch bản, vẽ hình minh họa và lồng tiếng hoạt hình sinh động.',
                  'WynMotion utilizes Generative AI to craft scripts, illustrative artwork, and synchronized voiceovers.'
                )}
              </p>
            </div>
          </div>

          {/* Item 2: Photo Library & Files */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 flex-shrink-0 mt-0.5">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">
                {t('Lưu Video & Tải Ảnh (Photos & Files)', 'Save Videos & Media Access')}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t(
                  'Ứng dụng cần quyền lưu vào Cuộn Camera (Photos) và Tệp (Files) để bạn có thể tải video MP4 thành phẩm về máy.',
                  'Permission to access Photos and Files is required to save exported MP4 videos and select custom assets.'
                )}
              </p>
            </div>
          </div>

          {/* Item 3: Microphone */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">
                {t('Thu Âm Giọng Đọc (Microphone)', 'Voice Recording (Microphone)')}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t(
                  'Được sử dụng khi bạn chọn tự thu âm giọng đọc thuyết minh trực tiếp cho các phân cảnh video.',
                  'Used optionally when you choose to record your own custom voice narration for video scenes.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={handleAccept}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('Tôi Đã Hiểu & Tiếp Tục', 'I Understand & Continue')}</span>
        </button>
      </div>
    </div>
  );
};
