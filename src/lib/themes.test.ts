import { describe, expect, it } from "vitest";
import { getThemeById, themes } from "./themes";

describe("themes", () => {
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

  it("falls back to punk when a theme id is unknown", () => {
    expect(getThemeById("missing").id).toBe("punk");
  });
});
