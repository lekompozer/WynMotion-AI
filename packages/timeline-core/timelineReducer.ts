import { TimelineState, TimelineAction } from './types';

export const initialTimelineState: TimelineState = {
  totalDuration: 15.0,
  currentTime: 0,
  zoom: 50, // 50px per second
  tracks: [],
  selectedItemId: null,
  isPlaying: false,
};

export function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: Math.max(0, Math.min(state.totalDuration, action.payload)),
      };
    case 'SET_TOTAL_DURATION':
      return {
        ...state,
        totalDuration: Math.max(1, action.payload),
      };
    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(15, Math.min(200, action.payload)),
      };
    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload,
      };
    case 'SELECT_ITEM':
      return {
        ...state,
        selectedItemId: action.payload,
      };
    case 'UPDATE_ITEM_DURATION': {
      const { itemId, newStartTime, newDuration } = action.payload;
      const updatedTracks = state.tracks.map((track) => {
        return {
          ...track,
          items: track.items.map((item) => {
            if (item.id === itemId) {
              const start = Math.max(0, newStartTime);
              const dur = Math.max(0.1, newDuration);
              return {
                ...item,
                startTime: start,
                duration: dur,
                endTime: start + dur,
              };
            }
            return item;
          }),
        };
      });
      return { ...state, tracks: updatedTracks };
    }
    case 'CHANGE_SHADER': {
      const { itemId, shaderName } = action.payload;
      const updatedTracks = state.tracks.map((track) => {
        return {
          ...track,
          items: track.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                shaderName,
                title: shaderName,
              };
            }
            return item;
          }),
        };
      });
      return { ...state, tracks: updatedTracks };
    }
    case 'SET_TRACKS':
      return {
        ...state,
        tracks: action.payload,
      };
    default:
      return state;
  }
}
