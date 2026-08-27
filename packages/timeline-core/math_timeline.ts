export function timeToPixels(seconds: number, zoom: number): number {
  return Math.max(0, seconds * zoom);
}

export function pixelsToTime(pixels: number, zoom: number): number {
  if (zoom <= 0) return 0;
  return Math.max(0, pixels / zoom);
}

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function snapToGrid(time: number, snapInterval: number = 0.1): number {
  return Math.round(time / snapInterval) * snapInterval;
}
