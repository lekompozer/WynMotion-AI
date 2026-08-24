'use client';

/**
 * DynamicAnimationComposition.tsx — WynMotion-AI iOS Studio
 *
 * Exact 1:1 Parity with wordai Web DynamicAnimationComposition.tsx:
 * - Wraps scenes into Remotion Sequences based on start_frame and duration_frames
 * - Passes showSceneCards, showWhisperSubs, cardPosY, subsPosY to DynamicSceneRenderer
 */

import React from 'react';
import { Sequence, useRemotion } from './RemotionEngine';
import { DynamicSceneRenderer, DynamicSceneData } from './DynamicSceneRenderer';

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
}

export const DynamicAnimationComposition: React.FC<DynamicAnimationCompositionProps> = ({
  scenes = [],
  visualStyle = 'handdrawn_fast_doodle',
  showSceneCards = true,
  showWhisperSubs = true,
  cardPosY = 'middle',
  subsPosY = 'bottom',
  swapSpeakers = false,
  onCardClick,
  onSubsClick,
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
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        No scenes available
      </div>
    );
  }

  const isPureVisualAds =
    (visualStyle || '').toLowerCase().includes('product_ads') ||
    (visualStyle || '').toLowerCase().includes('commercial_ads') ||
    (visualStyle || '').toLowerCase().includes('brand_ads');

  return (
    <>
      {scenes.map((scene, index) => {
        const from = scene.start_frame || 0;
        const durationInFrames = scene.duration_frames || 150;

        return (
          <Sequence
            key={scene.scene_id || index}
            from={from}
            durationInFrames={durationInFrames}
          >
            <DynamicSceneRenderer
              scene={scene}
              visualStyle={visualStyle}
              showSceneCards={isPureVisualAds ? false : showSceneCards}
              showWhisperSubs={isPureVisualAds ? false : showWhisperSubs}
              cardPosY={cardPosY}
              subsPosY={subsPosY}
              swapSpeakers={swapSpeakers}
              onCardClick={onCardClick}
              onSubsClick={onSubsClick}
            />
          </Sequence>
        );
      })}
    </>
  );
};
