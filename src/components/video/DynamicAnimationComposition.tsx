'use client';

import React from 'react';
import { Sequence, useRemotion } from './RemotionEngine';
import { DynamicSceneRenderer, DynamicSceneData } from './DynamicSceneRenderer';
import { CapCutCaptionRenderer, CaptionSegment, CaptionPresetStyle } from './subtitles/CapCutCaptionRenderer';

interface DynamicAnimationCompositionProps {
  scenes?: DynamicSceneData[];
  visualStyle?: string;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
  cardPosY?: 'top' | 'middle' | 'bottom';
  subsPosY?: 'top' | 'middle' | 'bottom';
  swapSpeakers?: boolean;
  onCardClick?: () => void;
  onSubsClick?: () => void;
  captionSegments?: CaptionSegment[];
  captionPresetStyle?: CaptionPresetStyle;
}

export const DynamicAnimationComposition: React.FC<DynamicAnimationCompositionProps> = ({
  scenes = [],
  visualStyle = 'handdrawn_fast_doodle',
  showSceneCards = true,
  showWhisperSubs = true,
  cardPosY = 'middle',
  subsPosY = 'bottom',
  swapSpeakers,
  onCardClick,
  onSubsClick,
  captionSegments = [],
  captionPresetStyle = 'karaoke_glow',
}) => {
  const { bgColor } = useRemotion();

  if (!scenes || scenes.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          backgroundColor: bgColor || '#FDFBF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748B',
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        Chưa có Scene nào được nạp...
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: bgColor || (visualStyle === 'vector_motion' ? '#0F172A' : '#FDFBF7'),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {scenes.map((scene) => (
        <Sequence
          key={scene.scene_id}
          from={scene.start_frame || 0}
          durationInFrames={scene.duration_frames || 150}
        >
          <DynamicSceneRenderer
            scene={scene}
            visualStyle={visualStyle}
            showSceneCards={showSceneCards}
            showWhisperSubs={captionSegments.length > 0 ? false : showWhisperSubs}
            cardPosY={cardPosY}
            subsPosY={subsPosY}
          />
        </Sequence>
      ))}

      {/* CapCut Animated Caption Engine (Global Subtitle Layer) */}
      {showWhisperSubs && captionSegments && captionSegments.length > 0 && (
        <CapCutCaptionRenderer
          segments={captionSegments}
          presetStyle={captionPresetStyle}
          positionY={subsPosY}
        />
      )}
    </div>
  );
};
