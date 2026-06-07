import type { CenterGuideState } from "@/cover/components/coverEditorTypes";

const DEFAULT_CENTER_SNAP_THRESHOLD = 3;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snapAxis(position: number, size: number, max: number, threshold: number) {
  const clampedPosition = clamp(position, 0, Math.max(0, max));
  const center = clampedPosition + size / 2;
  const snapped = Math.abs(center - 50) <= threshold;

  return {
    value: snapped ? clamp(50 - size / 2, 0, Math.max(0, max)) : clampedPosition,
    snapped,
  };
}

export function snapLayerToCanvasCenter({
  startX,
  startY,
  deltaX,
  deltaY,
  layerWidth,
  layerHeight,
  maxY = 92,
  threshold = DEFAULT_CENTER_SNAP_THRESHOLD,
}: {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  layerWidth: number;
  layerHeight: number;
  maxY?: number;
  threshold?: number;
}): { x: number; y: number; guides: CenterGuideState } {
  const nextX = snapAxis(startX + deltaX, layerWidth, 100 - layerWidth, threshold);
  const nextY = snapAxis(startY + deltaY, layerHeight, maxY, threshold);

  return {
    x: nextX.value,
    y: nextY.value,
    guides: {
      vertical: nextX.snapped,
      horizontal: nextY.snapped,
    },
  };
}
