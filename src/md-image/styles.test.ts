import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/md-image/styles.css"), "utf8");

function getRule(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));

  return match?.[1] ?? "";
}

describe("Markdown image scoped styles", () => {
  it("restores native iPhone Notes list markers", () => {
    expect(css).toContain(".theme-iphone-notes ul {\n  list-style-type: disc;");
    expect(css).toContain(".theme-iphone-notes ol {\n  list-style-type: decimal;");
    expect(getRule(".theme-iphone-notes li::marker")).toContain("font-weight: 400");
  });

  it("restores markdown list markers for every page theme", () => {
    expect(css).toContain(".xhs-page ul {\n  list-style-type: disc;");
    expect(css).toContain(".xhs-page ol {\n  list-style-type: decimal;");
  });

  it("centers Markdown image captions", () => {
    expect(getRule(".xhs-page figcaption")).toContain("text-align: center");
  });

  it("styles Markdown tables with theme syntax variables", () => {
    expect(getRule(".xhs-table")).toContain("border-collapse: collapse");
    expect(getRule(".xhs-table th")).toContain("background: var(--syntax-table-header-bg)");
    expect(getRule(".xhs-table th")).toContain("color: var(--syntax-table-header)");
    expect(getRule(".xhs-table th,\n.xhs-table td")).toContain(
      "border: max(2px, var(--page-border-width)) solid var(--syntax-table-border)",
    );
    expect(getRule(".xhs-table tbody tr:nth-child(even) td")).toContain(
      "background: var(--syntax-table-row-alt-bg)",
    );
  });

  it("renders Markdown images at their intrinsic size without a fixed frame", () => {
    const imageRule = getRule(".xhs-page figure > img");

    expect(css).toContain(
      ".xhs-page figure {\n  width: fit-content;\n  max-width: 100%;\n  align-self: flex-start;\n}",
    );
    expect(imageRule).toContain("width: auto");
    expect(imageRule).toContain("max-width: 100%");
    expect(imageRule).toContain("height: auto");
    expect(imageRule).not.toContain("max-height:");
    expect(imageRule).not.toContain("object-fit:");
    expect(getRule(".theme-notebook-grid figure")).toBe("");
  });

  it("supports the optional crop-to-fit mode", () => {
    const cropRule = getRule(".xhs-page.image-crop-to-fit figure > img");

    expect(cropRule).toContain("width: 100%");
    expect(cropRule).toContain("max-height: 460px");
    expect(cropRule).toContain("object-fit: cover");
  });

  it("keeps Markdown image styles from overriding the author watermark avatar", () => {
    expect(getRule(".xhs-page img")).toBe("");
    expect(getRule(".xhs-page figure > img")).toContain("width: auto");
    expect(getRule(".xhs-page .xhs-watermark-avatar")).toContain("border-radius: 999px");
  });

  it("uses a prominent WeChat-style author watermark", () => {
    const watermarkRule = getRule(".xhs-watermark");
    const avatarRule = getRule(".xhs-page .xhs-watermark-avatar");

    expect(watermarkRule).toContain("top: calc(var(--page-padding) * 0.12)");
    expect(watermarkRule).toContain("right: calc(var(--page-padding) * 0.12)");
    expect(watermarkRule).toContain("background: rgba(255, 255, 255, 0.9)");
    expect(watermarkRule).not.toContain("backdrop-filter");
    expect(watermarkRule).toContain("font-size: max(14px, calc(var(--page-base) * 0.34))");
    expect(avatarRule).toContain("width: 44px");
    expect(avatarRule).toContain("height: 44px");
  });

  it("keeps Markdown workspace chrome in Tailwind classes instead of scoped CSS", () => {
    expect(css).not.toContain(".app-shell");
    expect(css).not.toContain(".workspace-panel");
    expect(css).not.toContain(".preview-panel");
    expect(css).not.toContain(".markdown-input");
    expect(css).not.toContain(".settings-panel");
  });
});
