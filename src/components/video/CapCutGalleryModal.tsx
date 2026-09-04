'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Scissors, ArrowLeft, Globe, ChevronDown, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { wynmotionService } from '@/services/wynmotionService';
import { preloadAllTemplateVideos } from '@/utils/templateVideoCache';

export interface CapCutGalleryItem {
  id: string;
  title: string;
  titleVi: string;
  titleEn: string;
  category: string;
  duration: string;
  usageCount: string;
  author: string;
  authorAvatar: string;
  coverUrl: string;
  aspectClass: string;
  badge?: string;
  rawTemplate?: any;
}

export interface CapCutCategoryConfig {
  id: string;
  nameVi: string;
  nameEn: string;
  styles: string[];
  icon: string;
}

export const CAPCUT_CATEGORIES: CapCutCategoryConfig[] = [
  { id: 'all', nameVi: 'Tất cả mẫu', nameEn: 'All', styles: [], icon: '🔥' },
  { id: 'business_short_video', nameVi: 'Quảng Cáo Doanh Nghiệp', nameEn: 'Business Short Video', styles: ['animation_ads_image_veo', 'ads_strobe_teaser', 'ads_cinematic_showcase'], icon: '🛍️' },
  { id: 'video_news_60s', nameVi: 'Bản Tin Nóng 60s', nameEn: '60s Video News', styles: ['video_news_60s'], icon: '📰' },
  { id: 'illustrative', nameVi: 'Minh Họa & Vẽ Tay', nameEn: 'Illustrative', styles: ['whiteboard_stream_hand', 'handdrawn_fast_doodle', 'character_animation'], icon: '🎨' },
  { id: 'motion_explainer', nameVi: 'Chuyển Động & Diễn Giải', nameEn: 'Motion Explainer', styles: ['dialogue_scene', 'science_explainer', 'apple_modern_motion'], icon: '💬' },
  { id: 'animation_ads_image_veo', nameVi: 'Animation Ads (VEO 3.1)', nameEn: 'Animation Ads (VEO 3.1)', styles: ['animation_ads_image_veo'], icon: '👑' },
  { id: 'ads_strobe_teaser', nameVi: 'Strobe Teaser', nameEn: 'Strobe Teaser', styles: ['ads_strobe_teaser'], icon: '⚡' },
  { id: 'ads_cinematic_showcase', nameVi: 'Menu Thực Đơn (F&B)', nameEn: 'Cinematic Menu (F&B)', styles: ['ads_cinematic_showcase'], icon: '🍔' },
  { id: 'science_explainer', nameVi: 'Khoa Học STEM', nameEn: 'Science STEM', styles: ['science_explainer'], icon: '🔬' },
  { id: 'whiteboard_stream_hand', nameVi: 'Vẽ Bảng Trắng', nameEn: 'Whiteboard', styles: ['whiteboard_stream_hand'], icon: '✏️' },
  { id: 'handdrawn_fast_doodle', nameVi: 'Phác Chì & Màu Nước', nameEn: 'Doodle Quick', styles: ['handdrawn_fast_doodle'], icon: '🎨' },
  { id: 'dialogue_scene', nameVi: 'Hội Thoại 2 Người', nameEn: 'Dialogue Scene', styles: ['dialogue_scene'], icon: '💬' },
  { id: 'character_animation', nameVi: 'Mascot & Người Que', nameEn: 'Stickman & Mascot', styles: ['character_animation'], icon: '🏃' },
  { id: 'apple_modern_motion', nameVi: 'Apple UI Glass', nameEn: 'Modern Motion', styles: ['apple_modern_motion'], icon: '✨' },
];

export const TEMPLATE_LANGUAGES = [
  { code: 'all', flag: '🌐', nameVi: 'Tất cả ngôn ngữ', nameEn: 'All Languages', subVi: 'Tất cả giọng đọc', subEn: 'All Voices' },
  { code: 'en', flag: '🇺🇸', nameVi: 'English', nameEn: 'English', subVi: 'Tiếng Anh', subEn: 'English' },
  { code: 'vi', flag: '🇻🇳', nameVi: 'Tiếng Việt', nameEn: 'Vietnamese', subVi: 'Tiếng Việt', subEn: 'Vietnamese' },
  { code: 'zh', flag: '🇨🇳', nameVi: '中文', nameEn: 'Chinese', subVi: 'Tiếng Trung', subEn: 'Chinese' },
  { code: 'ko', flag: '🇰🇷', nameVi: '한국어', nameEn: 'Korean', subVi: 'Tiếng Hàn', subEn: 'Korean' },
  { code: 'ja', flag: '🇯🇵', nameVi: '日本語', nameEn: 'Japanese', subVi: 'Tiếng Nhật', subEn: 'Japanese' },
  { code: 'ms', flag: '🇲🇾', nameVi: 'Melayu', nameEn: 'Malay', subVi: 'Tiếng Mã Lai', subEn: 'Malay' },
  { code: 'id', flag: '🇮🇩', nameVi: 'Indonesia', nameEn: 'Indonesian', subVi: 'Tiếng Indo', subEn: 'Indonesian' },
  { code: 'th', flag: '🇹🇭', nameVi: 'ภาษาไทย', nameEn: 'Thai', subVi: 'Tiếng Thái', subEn: 'Thai' },
  { code: 'es', flag: '🇪🇸', nameVi: 'Español', nameEn: 'Spanish', subVi: 'Tây Ban Nha', subEn: 'Spanish' },
  { code: 'pt', flag: '🇧🇷', nameVi: 'Português', nameEn: 'Portuguese', subVi: 'Bồ Đào Nha', subEn: 'Portuguese' },
  { code: 'hi', flag: '🇮🇳', nameVi: 'हिन्दी', nameEn: 'Hindi', subVi: 'Tiếng Hindi', subEn: 'Hindi' },
  { code: 'bn', flag: '🇧🇩', nameVi: 'বাংলা', nameEn: 'Bengali', subVi: 'Tiếng Bengal', subEn: 'Bengali' },
];

interface CapCutGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: any) => void;
  initialCategory?: string;
  onCreateBlankProject?: (styleId?: string) => void;
}

export const CapCutGalleryModal: React.FC<CapCutGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  initialCategory,
  onCreateBlankProject,
}) => {
  const { isVietnamese, t } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategory || 'all');
  const [selectedLang, setSelectedLang] = useState('all');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [templatesList, setTemplatesList] = useState<CapCutGalleryItem[]>([]);

  // Update selectedCategory when initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      // Find matching category ID or map visual style
      const matched = CAPCUT_CATEGORIES.find(
        (c) => c.id === initialCategory || c.styles.includes(initialCategory)
      );
      if (matched) {
        setSelectedCategoryId(matched.id);
      } else {
        setSelectedCategoryId('all');
      }
    }
  }, [initialCategory, isOpen]);

  // Fetch dynamic templates directly from Backend API on mount
  useEffect(() => {
    let isMounted = true;
    wynmotionService.getTemplates().then((res) => {
      if (isMounted && res && res.success && res.templates && res.templates.length > 0) {
        const mapped: CapCutGalleryItem[] = res.templates.map((t) => ({
          id: t.template_id,
          title: t.title_vi || t.title_en || t.template_id,
          titleVi: t.title_vi || t.title_en || t.template_id,
          titleEn: t.title_en || t.title_vi || t.template_id,
          category: t.category || 'Sản phẩm',
          duration: `${t.duration_sec}s`,
          usageCount: t.usage_count || '50K',
          author: t.is_vip ? 'VIP Motion AI' : 'WynMotion',
          authorAvatar: t.is_vip ? '👑' : '✨',
          coverUrl: t.cover_ios_url || t.cover_url || '/templates/cover-animation-ads-image-ios.png',
          aspectClass: t.aspect_class || 'aspect-[9/16]',
          badge: t.badge || (t.is_vip ? '👑 VIP 12s' : undefined),
          rawTemplate: t,
        }));
        setTemplatesList(mapped);
        preloadAllTemplateVideos(res.templates);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen) return null;

  const currentLangObj = TEMPLATE_LANGUAGES.find((l) => l.code === selectedLang) || TEMPLATE_LANGUAGES[0];
  const activeCatConfig = CAPCUT_CATEGORIES.find((c) => c.id === selectedCategoryId) || CAPCUT_CATEGORIES[0];

  const filteredTemplates = templatesList.filter((tpl) => {
    const raw = tpl.rawTemplate || {};
    const tplStyle = raw.visual_style || '';
    const tplLang = raw.default_params?.language || 'all';

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        (tpl.titleVi && tpl.titleVi.toLowerCase().includes(q)) ||
        (tpl.titleEn && tpl.titleEn.toLowerCase().includes(q)) ||
        tpl.title.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q) ||
        tplStyle.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // 2. Language Filter
    if (selectedLang !== 'all') {
      if (tplLang !== 'all' && tplLang !== selectedLang) {
        return false;
      }
    }

    // 3. Category Filter
    if (selectedCategoryId === 'all') return true;

    if (activeCatConfig.styles.length > 0) {
      return activeCatConfig.styles.includes(tplStyle);
    }

    return true;
  });

  const col1 = filteredTemplates.filter((_, idx) => idx % 2 === 0);
  const col2 = filteredTemplates.filter((_, idx) => idx % 2 === 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#090A10] text-white animate-in fade-in duration-200">
      {/* ── TOP SEARCH & BACK BAR (Shifted down for iOS Notch / Dynamic Island) ── */}
      <div
        className="px-4 pb-2 border-b border-slate-800/80 bg-[#090A10]/95 backdrop-blur-md flex items-center gap-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 44px), 44px)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Tìm kiếm mẫu...', 'Search templates...')}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORY PILLS BAR ── */}
      <div className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-slate-800/40 bg-[#090A10]">
        {CAPCUT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const catName = isVietnamese ? cat.nameVi : cat.nameEn;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-white text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800/60 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{catName}</span>
            </button>
          );
        })}
      </div>

      {/* ── CREATE BLANK PROJECT BANNER FOR SELECTED STYLE ── */}
      {selectedCategoryId !== 'all' && onCreateBlankProject && (
        <div className="px-4 pt-3 pb-1 max-w-lg mx-auto w-full">
          <button
            type="button"
            onClick={() => {
              const targetStyle = activeCatConfig.styles[0] || selectedCategoryId;
              onCreateBlankProject(targetStyle);
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold flex items-center justify-between transition-all active:scale-[0.99] shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{activeCatConfig.icon}</span>
              <span>
                {t('Tự tạo video mới với phong cách ', 'Create new video with style ')}
                <strong>{isVietnamese ? activeCatConfig.nameVi : activeCatConfig.nameEn}</strong>
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-cyan-400 text-slate-950 font-black">
              {t('Bắt đầu →', 'Start →')}
            </span>
          </button>
        </div>
      )}

      {/* ── 2-COLUMN STAGGERED MASONRY GRID (EQUAL CARD HEIGHT & WIDTH) ── */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 pb-20">
        <div className="grid grid-cols-2 gap-3 items-start max-w-lg mx-auto">
          {/* Empty state when no templates match */}
          {filteredTemplates.length === 0 && (
            <div className="col-span-2 text-center py-16 text-slate-400 text-xs">
              <p className="text-sm font-semibold">{t('Không tìm thấy mẫu phù hợp', 'No matching templates found')}</p>
              <p className="text-[11px] text-slate-500 mt-1">{t('Thử tìm kiếm với từ khóa hoặc danh mục khác', 'Try searching with another keyword or category')}</p>
            </div>
          )}

          {/* COLUMN 1 (Starts at top) */}
          <div className="space-y-3.5">
            {col1.map((item) => renderTemplateCard(item, onSelectTemplate, isVietnamese))}
          </div>

          {/* COLUMN 2 (Starts with Language Selector Card, creating staggered offset) */}
          <div className="space-y-3.5">
            {/* 🌐 12-Language Selector Filter Card (Default All) */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/95 to-slate-950 border border-teal-500/30 p-3 shadow-lg shadow-teal-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-teal-400 uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('Ngôn ngữ', 'Language')}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  12 Voice
                </span>
              </div>

              {/* Selected Language Display Trigger */}
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-left hover:border-teal-400 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{currentLangObj.flag}</span>
                  <div>
                    <div className="text-xs font-bold text-teal-200 leading-none">
                      {isVietnamese ? currentLangObj.nameVi : currentLangObj.nameEn}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5 leading-none">
                      {isVietnamese ? currentLangObj.subVi : currentLangObj.subEn}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-teal-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu (12 Languages matching Listen & Learn) */}
              {isLangDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-30 max-h-56 overflow-y-auto rounded-xl bg-[#0d141e] border border-teal-500/30 shadow-2xl p-1 space-y-0.5 scrollbar-thin">
                  {TEMPLATE_LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    const langName = isVietnamese ? lang.nameVi : lang.nameEn;
                    const langSub = isVietnamese ? lang.subVi : lang.subEn;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-teal-950/60 text-teal-300 border border-teal-500/40 font-bold'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span className="text-xs">{langName}</span>
                          <span className="text-[10px] text-slate-400">({langSub})</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column 2 Template Cards */}
            {col2.map((item) => renderTemplateCard(item, onSelectTemplate, isVietnamese))}
          </div>
        </div>
      </div>
    </div>
  );
};

function renderTemplateCard(
  item: CapCutGalleryItem,
  onSelect: (template: any) => void,
  isVietnamese: boolean
) {
  const displayTitle = isVietnamese ? (item.titleVi || item.title) : (item.titleEn || item.title);

  return (
    <div
      key={item.id}
      onClick={() => onSelect(item.rawTemplate || item)}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-900/70 border border-slate-800/90 hover:border-rose-500/60 transition-all active:scale-[0.98] shadow-lg flex flex-col w-full"
    >
      {/* Fixed uniform aspect-[9/16] container with max width & clean cover crop */}
      <div className="relative w-full aspect-[9/16] overflow-hidden bg-slate-950">
        <img
          src={item.coverUrl}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {item.badge && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-extrabold text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <span>💎</span>
            <span>{item.badge}</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white shadow-sm">
          <Scissors className="w-3 h-3 text-slate-300 rotate-90" />
          <span>{item.usageCount}</span>
        </div>

        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-bold text-slate-300">
          {item.duration}
        </div>
      </div>

      <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
        <h4 className="text-xs font-black text-white line-clamp-2 leading-snug group-hover:text-rose-400 transition-colors">
          {displayTitle}
        </h4>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px]">
            {item.authorAvatar}
          </div>
          <span className="truncate">{item.author}</span>
        </div>
      </div>
    </div>
  );
}
