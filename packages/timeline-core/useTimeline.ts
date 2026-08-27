'use client';

import { useReducer, useCallback } from 'react';
import { timelineReducer, initialTimelineState } from './timelineReducer';
import { TimelineTrack } from './types';

export function useTimeline(initialDuration: number = 15.0, initialZoom: number = 50) {
  const [state, dispatch] = useReducer(timelineReducer, {
    ...initialTimelineState,
    totalDuration: initialDuration,
    zoom: initialZoom,
  });

  const seek = useCallback((time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_PLAYING', payload: playing });
  }, []);

  const selectItem = useCallback((itemId: string | null) => {
    dispatch({ type: 'SELECT_ITEM', payload: itemId });
  }, []);

  const updateItemDuration = useCallback((itemId: string, newStartTime: number, newDuration: number) => {
    dispatch({
      type: 'UPDATE_ITEM_DURATION',
      payload: { itemId, newStartTime, newDuration },
    });
  }, []);

  const changeShader = useCallback((itemId: string, shaderName: string) => {
    dispatch({
      type: 'CHANGE_SHADER',
      payload: { itemId, shaderName },
    });
  }, []);

  const setTracks = useCallback((tracks: TimelineTrack[]) => {
    dispatch({ type: 'SET_TRACKS', payload: tracks });
  }, []);

  return {
    state,
    seek,
    setZoom,
    setPlaying,
    selectItem,
    updateItemDuration,
    changeShader,
    setTracks,
  };
}
