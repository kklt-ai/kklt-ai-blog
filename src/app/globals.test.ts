import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("global styles", () => {
  it("keeps Tailwind and shared application tokens in the global stylesheet", () => {
    expect(css).toContain('@import url("https://fontsapi.zeoseven.com/256/main/result.css");');
    expect(css).toContain("@tailwind base;");
    expect(css).toContain("--app-bg: #fef15a;");
    expect(css).toContain("--ink: #111111;");
    expect(css).toContain("font-family: Arial");
  });

  it("keeps Markdown image workspace chrome out of the global stylesheet", () => {
    expect(css).not.toContain(".app-shell");
    expect(css).not.toContain(".workspace-panel");
    expect(css).not.toContain(".preview-panel");
    expect(css).not.toContain(".markdown-input");
    expect(css).not.toContain(".settings-panel");
  });
});
