import { describe, expect, it } from "vitest";
import { clampDimensions, resolvePageDimensions } from "./dimensions";
import { getThemeById } from "./themes";

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

describe("resolvePageDimensions", () => {
  it("grows the page height to fit long content when fixed size is disabled", () => {
    const theme = getThemeById("punk");
    const dimensions = resolvePageDimensions(
      {
        id: "page-1",
        manualGroupIndex: 0,
        blocks: [],
        estimatedHeight: 2200,
      },
      { width: 1080, height: 1440 },
      theme,
      false,
    );

    expect(dimensions).toEqual({ width: 1080, height: 2200 + theme.padding * 2 });
  });

  it("keeps the configured size when fixed size is enabled", () => {
    const dimensions = resolvePageDimensions(
      {
        id: "page-1",
        manualGroupIndex: 0,
        blocks: [],
        estimatedHeight: 2200,
      },
      { width: 1080, height: 1440 },
      getThemeById("punk"),
      true,
    );

    expect(dimensions).toEqual({ width: 1080, height: 1440 });
  });
});
