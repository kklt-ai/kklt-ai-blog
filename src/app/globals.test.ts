import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

function getRule(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));

  return match?.[1] ?? "";
}

describe("global layout styles", () => {
  it("keeps the desktop settings panel from stretching with long preview content", () => {
    const settingsRule = getRule(".settings-panel");

    expect(settingsRule).toContain("align-self: start");
    expect(settingsRule).toContain("position: sticky");
    expect(settingsRule).toContain("top: 18px");
    expect(settingsRule).toContain("min-height: 0");
    expect(settingsRule).toContain("overflow: hidden");
    expect(settingsRule).not.toMatch(/(^|\n)\s*height:/);
  });

  it("restores native iPhone Notes list markers", () => {
    expect(css).toContain(".theme-iphone-notes ul {\n  list-style-type: disc;");
    expect(css).toContain(".theme-iphone-notes ol {\n  list-style-type: decimal;");
    expect(getRule(".theme-iphone-notes li::marker")).toContain("font-weight: 400");
  });
});
