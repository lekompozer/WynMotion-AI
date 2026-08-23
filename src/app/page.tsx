'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { AppHeader } from '@/components/navigation/AppHeader';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { AiVideoTab } from '@/components/tabs/AiVideoTab';
import { AiAudioTab } from '@/components/tabs/AiAudioTab';
import { AiImagesTab } from '@/components/tabs/AiImagesTab';
import { LibraryTab } from '@/components/tabs/LibraryTab';
import { AiNoticeModal } from '@/components/modals/AiNoticeModal';

export default function WynMotionMobileApp() {
  const { activeTab, isDark, isStudioOpen, setActiveTab } = useApp();

  const handleOpenProjectFromLibrary = (projectId: string) => {
    // Dispatch event so AiVideoTab can listen and open MobileVideoEditorStudio
    try {
      sessionStorage.setItem('wynmotion_open_project_id', projectId);
    } catch {}
    window.dispatchEvent(
      new CustomEvent('wynmotion:open-project', { detail: { projectId } })
    );
    setActiveTab('video');
  };

  return (
    <div
      className={`h-full w-full flex flex-col antialiased transition-colors duration-200 overflow-hidden ${
        isDark ? 'bg-[#080B10] text-slate-100' : 'bg-[#FAFAFC] text-slate-900'
      }`}
    >
      {/* 0. Apple-Compliant AI & Permissions Notice Modal */}
      <AiNoticeModal />

      {/* 1. iOS App Header — only shown on Audio, Images, Library tabs when not in full studio mode */}
      {!isStudioOpen && activeTab !== 'video' && <AppHeader />}

      {/* 2. Active Tab Content with Contained Smooth Scrolling */}
      <main
        className={`flex-1 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch ${
          isStudioOpen ? 'pb-0' : 'pb-[calc(max(env(safe-area-inset-bottom,0px),8px)+4.75rem)]'
        }`}
      >
        <div key={activeTab} className="animate-in fade-in-50 duration-200">
          {activeTab === 'video' && <AiVideoTab />}
          {activeTab === 'audio' && <AiAudioTab />}
          {activeTab === 'images' && <AiImagesTab />}
          {activeTab === 'library' && (
            <LibraryTab
              onOpenProject={handleOpenProjectFromLibrary}
              onUseAudioInVideo={(audioUrl, audioName) => {
                try {
                  sessionStorage.setItem('wynmotion_use_audio_url', audioUrl);
                  sessionStorage.setItem('wynmotion_use_audio_name', audioName);
                } catch {}
                window.dispatchEvent(
                  new CustomEvent('wynmotion:use-audio', { detail: { audioUrl, audioName } })
                );
                setActiveTab('video');
              }}
            />
          )}
        </div>
      </main>

      {/* 3. iOS Bottom Navigation Bar — Rock-Solid Pinned at Bottom */}
      {!isStudioOpen && <MobileBottomNav />}
    </div>
  );
}
