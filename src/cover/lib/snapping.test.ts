import { describe, expect, it } from "vitest";
import { snapLayerToCanvasCenter } from "./snapping";

describe("snapLayerToCanvasCenter", () => {
  it("snaps a layer to the horizontal canvas center and enables the vertical guide", () => {
    const result = snapLayerToCanvasCenter({
      startX: 18,
      startY: 20,
      deltaX: 1,
      deltaY: 0,
      layerWidth: 64,
      layerHeight: 10,
    });

    expect(result).toEqual({
      x: 18,
      y: 20,
      guides: {
        vertical: true,
        horizontal: false,
      },
    });
  });

  it("snaps an icon to both canvas center guides", () => {
    const result = snapLayerToCanvasCenter({
      startX: 72,
      startY: 12,
      deltaX: -28,
      deltaY: 31,
      layerWidth: 13,
      layerHeight: 13,
    });

    expect(result).toEqual({
      x: 43.5,
      y: 43.5,
      guides: {
        vertical: true,
        horizontal: true,
      },
    });
  });

  it("keeps the dragged position when the layer center is outside the snap range", () => {
    const result = snapLayerToCanvasCenter({
      startX: 10,
      startY: 20,
      deltaX: 8,
      deltaY: 5,
      layerWidth: 20,
      layerHeight: 12,
    });

    expect(result).toEqual({
      x: 18,
      y: 25,
      guides: {
        vertical: false,
        horizontal: false,
      },
    });
  });
});
