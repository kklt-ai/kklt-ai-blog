import { describe, expect, it } from "vitest";
import { defaultTheme, getThemeById, themes } from "./themes";

describe("themes", () => {
  const referenceThemeIds = [
    "minimalist",
    "elegant-vintage",
    "futuristic-tech",
    "scandinavian",
    "art-deco",
    "cyberpunk",
    "vaporwave",
    "bauhaus",
    "constructivism",
    "victorian",
    "neo-baroque",
    "german-expressionism",
  ];

  it("includes the required first-version theme directions", () => {
    const ids = themes.map((theme) => theme.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "japanese-minimal",
        "iphone-notes",
        "punk",
        "memphis",
        "pop-art",
      ]),
    );
  });

  it("includes distinct additions from the reference style set", () => {
    const ids = themes.map((theme) => theme.id);

    expect(ids).toEqual(expect.arrayContaining(referenceThemeIds));
  });

  it("includes a notebook grid theme for note-style cards", () => {
    const theme = getThemeById("notebook-grid");

    expect(theme.name).toBe("方格笔记本");
    expect(theme.motif).toBe("notebook-grid");
    expect(theme.colors.background).toBe("#fbfbfa");
    expect(theme.colors.accent).toBe("#ff3d00");
  });

  it("keeps theme identifiers unique", () => {
    const ids = themes.map((theme) => theme.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("defines complete visual tokens for every theme", () => {
    themes.forEach((theme) => {
      expect(theme.name).not.toHaveLength(0);
      expect(theme.description).not.toHaveLength(0);
      expect(theme.fontFamily).not.toHaveLength(0);
      expect(theme.padding).toBeGreaterThan(0);
      expect(theme.baseFontSize).toBeGreaterThan(0);
      expect(theme.lineHeight).toBeGreaterThan(1);
      expect(theme.blockGap).toBeGreaterThan(0);
      expect(Object.values(theme.colors)).not.toContain("");
      expect(Object.values(theme.syntax)).not.toContain("");
    });
  });

  it("uses Memphis as the default theme", () => {
    expect(defaultTheme.id).toBe("memphis");
  });

  it("falls back to Memphis when a theme id is unknown", () => {
    expect(getThemeById("missing").id).toBe("memphis");
  });
});
