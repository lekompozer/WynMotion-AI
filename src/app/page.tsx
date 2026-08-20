'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { AppHeader } from '@/components/navigation/AppHeader';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { AiVideoTab } from '@/components/tabs/AiVideoTab';
import { AiAudioTab } from '@/components/tabs/AiAudioTab';
import { AiImagesTab } from '@/components/tabs/AiImagesTab';
import { LibraryTab } from '@/components/tabs/LibraryTab';

export default function WynMotionMobileApp() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col antialiased">
      {/* 1. iOS App Header */}
      <AppHeader />

      {/* 2. Active Tab Content */}
      <main className="flex-1 pb-24 pt-2 overflow-y-auto">
        {activeTab === 'video' && <AiVideoTab />}
        {activeTab === 'audio' && <AiAudioTab />}
        {activeTab === 'images' && <AiImagesTab />}
        {activeTab === 'library' && <LibraryTab />}
      </main>

      {/* 3. iOS Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
