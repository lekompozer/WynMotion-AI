export type TrackType = 'video' | 'transitions' | 'effects' | 'captions' | 'audio';

export interface TimelineItem {
  id: string;
  trackId: string;
  trackType: TrackType;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  duration: number;  // in seconds
  title: string;
  color?: string;
  params?: Record<string, any>;
  shaderName?: string; // for transitions and GLSL shaders
  thumbnailUrl?: string;
}

export interface TimelineTrack {
  id: string;
  type: TrackType;
  name: string;
  items: TimelineItem[];
  muted?: boolean;
  locked?: boolean;
}

export interface TimelineState {
  totalDuration: number;
  currentTime: number;
  zoom: number; // pixels per second (e.g. 50px/s on desktop, 30px/s on mobile)
  tracks: TimelineTrack[];
  selectedItemId: string | null;
  isPlaying: boolean;
}

export type TimelineAction =
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_TOTAL_DURATION'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SELECT_ITEM'; payload: string | null }
  | { type: 'UPDATE_ITEM_DURATION'; payload: { itemId: string; newStartTime: number; newDuration: number } }
  | { type: 'CHANGE_SHADER'; payload: { itemId: string; shaderName: string } }
  | { type: 'SET_TRACKS'; payload: TimelineTrack[] };
