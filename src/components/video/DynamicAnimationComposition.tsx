import React from 'react';
import { Sequence, useRemotion, useCurrentFrame, useVideoConfig } from './RemotionEngine';
import { DynamicSceneRenderer, DynamicSceneData } from './DynamicSceneRenderer';
import { CapCutCaptionRenderer, CaptionSegment, CaptionPresetStyle } from './subtitles/CapCutCaptionRenderer';
import { ActiveEffectsOverlay, CustomTimelineEffect } from './styles/ActiveEffectsOverlay';
import { GLSLTransitionCanvas } from './styles/transitions/GLSLTransitionCanvas';
import { SHADERS_MAP } from '../../../packages/core-effects/shadersMap';

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
  onUpdateScene?: (sceneId: string | number, updated: Partial<DynamicSceneData>) => void;
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
  onUpdateScene,
}) => {
  const { bgColor } = useRemotion();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / (fps || 30);

  const activeVisualEffects = (timelineEffects || []).filter(
    (fx) => !fx.id.startsWith('fx_trans_') && currentTime >= fx.startTime && currentTime <= fx.endTime
  );

  const activeTransitions = (timelineEffects || []).filter(
    (fx) => (fx.id.startsWith('fx_trans_') || fx.shaderName) && currentTime >= fx.startTime && currentTime <= fx.endTime
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
        backgroundColor: bgColor || (visualStyle === 'vector_motion' ? '#0F172A' : '#000000'),
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
            onUpdateScene={(updated) => onUpdateScene?.(scene.scene_id, updated)}
          />
        </Sequence>
      ))}

      {/* 125 GLSL Active WebGL Transitions Overlay */}
      {activeTransitions.map((fx) => {
        const transProg = Math.min(1.0, Math.max(0, (currentTime - fx.startTime) / Math.max(0.1, fx.duration)));
        const midTime = fx.startTime + fx.duration / 2;
        let currSceneIdx = scenes.findIndex((s) => {
          const sSt = s.start_sec ?? ((s.start_frame || 0) / (fps || 30));
          const sDur = s.duration_sec ?? ((s.duration_frames || 150) / (fps || 30));
          return midTime >= sSt && midTime <= sSt + sDur + 0.1;
        });
        if (currSceneIdx < 0) {
          currSceneIdx = scenes.findIndex((s) => {
            const sSt = s.start_sec ?? ((s.start_frame || 0) / (fps || 30));
            const sDur = s.duration_sec ?? ((s.duration_frames || 150) / (fps || 30));
            return fx.startTime <= sSt + sDur && fx.startTime + fx.duration >= sSt;
          });
        }
        const fromScene = scenes[currSceneIdx >= 0 ? currSceneIdx : 0];
        const nextIdx =
          currSceneIdx >= 0 && currSceneIdx + 1 < scenes.length ? currSceneIdx + 1 : currSceneIdx >= 0 ? currSceneIdx : 0;
        const toScene = scenes[nextIdx];
        const fromImg = fromScene?.image_url || fromScene?.original_image_url || '/png-fox.png';
        const toImg = toScene?.image_url || toScene?.original_image_url || fromImg;
        const shaderName = fx.shaderName || fx.effectId || 'GlitchMemories';
        const shaderSource =
          SHADERS_MAP[shaderName] ||
          'vec4 transition(vec2 uv) { return mix(getFromColor(uv), getToColor(uv), progress); }';

        return (
          <div key={fx.id} className="absolute inset-0 w-full h-full z-40 pointer-events-none">
            <GLSLTransitionCanvas
              fromImage={fromImg}
              toImage={toImg}
              progress={transProg}
              glslSource={shaderSource}
            />
          </div>
        );
      })}

      {/* Real-time Global Live Visual Effects Overlay */}
      <ActiveEffectsOverlay
        activeEffects={activeVisualEffects}
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
