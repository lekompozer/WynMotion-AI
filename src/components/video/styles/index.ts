'use client';

import React from 'react';
import { StyleRendererProps, DialogueSceneRenderer } from './DialogueSceneRenderer';

export { DialogueSceneRenderer };
export type { StyleRendererProps };

/**
 * Registry of modular visual style renderers.
 * Adding new styles (7 to 30+) is as simple as adding an entry to this map!
 */
export const MODULAR_STYLE_RENDERERS: Record<string, React.FC<StyleRendererProps>> = {
  dialogue_scene: DialogueSceneRenderer,
  conversation: DialogueSceneRenderer,
  podcast_dual: DialogueSceneRenderer,
};

export function getModularStyleRenderer(visualStyle?: string): React.FC<StyleRendererProps> | null {
  if (!visualStyle) return null;
  const key = visualStyle.toLowerCase();
  return MODULAR_STYLE_RENDERERS[key] || null;
}
