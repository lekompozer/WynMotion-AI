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
        backgroundColor: bgColor || (visualStyle === 'vector_motion' || visualStyle === 'apple_modern_motion' || visualStyle === 'tech_ui' ? '#090A10' : '#FDFBF7'),
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
            showWhisperSubs={showWhisperSubs}
            cardPosY={cardPosY}
            subsPosY={subsPosY}
            onCardClick={onCardClick}
            onSubsClick={onSubsClick}
          />
        </Sequence>
      ))}
    </div>
  );
};
