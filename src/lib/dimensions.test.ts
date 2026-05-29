import { describe, expect, it } from "vitest";
import { clampDimensions } from "./dimensions";

describe("clampDimensions", () => {
  it("clamps dimensions into the supported range", () => {
    expect(clampDimensions({ width: 200, height: 9999 })).toEqual({
      width: 600,
      height: 2400,
    });
  });

  it("normalizes non-numeric values to the default Xiaohongshu size", () => {
    expect(clampDimensions({ width: Number.NaN, height: Number.NaN })).toEqual({
      width: 1080,
      height: 1440,
    });
  });
});
