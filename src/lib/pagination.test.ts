import { describe, expect, it } from "vitest";
import { paginateSegments } from "./pagination";
import { getThemeById } from "./themes";
import type { MarkdownBlock } from "./types";

describe("paginateSegments", () => {
  it("keeps manual groups separated", () => {
    const pages = paginateSegments(
      [
        [{ type: "heading", depth: 1, text: "A" }],
        [{ type: "heading", depth: 1, text: "B" }],
      ],
      { width: 1080, height: 1440 },
      getThemeById("punk"),
      true,
    );

    expect(pages).toHaveLength(2);
    expect(pages.map((page) => page.manualGroupIndex)).toEqual([0, 1]);
  });

  it("creates extra pages for long content when auto pagination is enabled", () => {
    const blocks: MarkdownBlock[] = Array.from({ length: 30 }, (_, index) => ({
      type: "paragraph",
      text: `Paragraph ${index} `.repeat(20),
    }));

    const pages = paginateSegments(
      [blocks],
      { width: 1080, height: 900 },
      getThemeById("punk"),
      true,
    );

    expect(pages.length).toBeGreaterThan(1);
  });
});
