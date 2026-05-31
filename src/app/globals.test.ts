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

  it("restores markdown list markers for every page theme", () => {
    expect(css).toContain(".xhs-page ul {\n  list-style-type: disc;");
    expect(css).toContain(".xhs-page ol {\n  list-style-type: decimal;");
  });

  it("keeps preview selection chrome outside the exported page edge", () => {
    const previewItemRule = getRule(".preview-item");
    const activePreviewItemRule = getRule(".preview-item.is-active");

    expect(previewItemRule).not.toContain("border:");
    expect(activePreviewItemRule).not.toContain("border-color:");
    expect(activePreviewItemRule).toContain("outline:");
    expect(activePreviewItemRule).toContain("outline-offset:");
  });

  it("centers Markdown image captions", () => {
    expect(getRule(".xhs-page figcaption")).toContain("text-align: center");
  });

  it("keeps Markdown image styles from overriding the author watermark avatar", () => {
    expect(getRule(".xhs-page img")).toBe("");
    expect(getRule(".xhs-page figure > img")).toContain("width: 100%");
    expect(getRule(".xhs-page .xhs-watermark-avatar")).toContain("border-radius: 999px");
  });

  it("uses a prominent WeChat-style author watermark", () => {
    const watermarkRule = getRule(".xhs-watermark");
    const avatarRule = getRule(".xhs-page .xhs-watermark-avatar");

    expect(watermarkRule).toContain("top: calc(var(--page-padding) * 0.32)");
    expect(watermarkRule).toContain("right: calc(var(--page-padding) * 0.32)");
    expect(watermarkRule).toContain("background: rgba(255, 255, 255, 0.9)");
    expect(watermarkRule).toContain("font-size: max(14px, calc(var(--page-base) * 0.34))");
    expect(avatarRule).toContain("width: 44px");
    expect(avatarRule).toContain("height: 44px");
  });
});
