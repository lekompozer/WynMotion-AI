import React from 'react';
import { Sequence, useRemotion, useCurrentFrame, useVideoConfig } from './RemotionEngine';
import { DynamicSceneRenderer, DynamicSceneData } from './DynamicSceneRenderer';
import { CapCutCaptionRenderer, CaptionSegment, CaptionPresetStyle } from './subtitles/CapCutCaptionRenderer';
import { ActiveEffectsOverlay, CustomTimelineEffect } from './styles/ActiveEffectsOverlay';

interface DynamicAnimationCompositionProps {
  scenes?: DynamicSceneData[];
  visualStyle?: string;
  showSceneCards?: boolean;
  showWhisperSubs?: boolean;
  cardPosY?: 'top' | 'middle' | 'bottom';
  subsPosY?: 'top' | 'middle' | 'bottom';
  captionSegments?: CaptionSegment[];
  captionPresetStyle?: CaptionPresetStyle;
  timelineEffects?: CustomTimelineEffect[];
  swapSpeakers?: boolean;
  onCardClick?: () => void;
  onSubsClick?: () => void;
  showSubCard?: boolean;
}

export const DynamicAnimationComposition: React.FC<DynamicAnimationCompositionProps> = ({
  scenes = [],
  visualStyle = 'handdrawn_fast_doodle',
  showSceneCards = true,
  showWhisperSubs = true,
  cardPosY = 'middle',
  subsPosY = 'bottom',
  captionSegments = [],
  captionPresetStyle = 'karaoke_glow',
  timelineEffects = [],
}) => {
  const { bgColor } = useRemotion();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / (fps || 30);

  const activeEffects = (timelineEffects || []).filter(
    (fx) => currentTime >= fx.startTime && currentTime <= fx.endTime
  );

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

      {/* Real-time Global Live Visual Effects Overlay */}
      <ActiveEffectsOverlay
        activeEffects={activeEffects}
        currentTime={currentTime}
        currentFrame={frame}
        fps={fps}
      />

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
