import { DEFAULT_DIMENSIONS } from "./sample";
import type { Dimensions, GeneratedPage, ThemeDefinition } from "./types";

const MIN_SIZE = 600;
const MAX_SIZE = 2400;

function normalize(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.round(Math.min(MAX_SIZE, Math.max(MIN_SIZE, value)));
}

export function clampDimensions(dimensions: Dimensions): Dimensions {
  return {
    width: normalize(dimensions.width, DEFAULT_DIMENSIONS.width),
    height: normalize(dimensions.height, DEFAULT_DIMENSIONS.height),
  };
}

export function resolvePageDimensions(
  page: GeneratedPage,
  dimensions: Dimensions,
  theme: ThemeDefinition,
  fixedSizeEnabled: boolean,
): Dimensions {
  if (fixedSizeEnabled) return dimensions;

  return {
    width: dimensions.width,
    height: Math.max(MIN_SIZE, Math.ceil(page.estimatedHeight + theme.padding * 2)),
  };
}
