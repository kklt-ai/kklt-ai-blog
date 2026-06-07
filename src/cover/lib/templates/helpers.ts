import { createIconLayer, createTextLayer } from "../layers";
import type { BrandIconId, CoverIconLayer, CoverTextLayer } from "../types";

export function templateTextLayer(
  id: string,
  text: string,
  overrides: Partial<CoverTextLayer>,
): CoverTextLayer {
  return {
    ...createTextLayer(text),
    id,
    ...overrides,
  };
}

export function templateIconLayer(
  id: string,
  iconId: BrandIconId,
  overrides: Partial<CoverIconLayer>,
): CoverIconLayer {
  return {
    ...createIconLayer(iconId),
    id,
    ...overrides,
  };
}
