import { describe, expect, it } from "vitest";
import { paginateSegments } from "./pagination";
import { getThemeById } from "./themes";
import type { MarkdownBlock } from "./types";

describe("paginateSegments", () => {
  it("keeps manual groups separated", () => {
    const pages = paginateSegments(
      [
        [{ type: "heading", depth: 1, text: "A", inline: [{ type: "text", text: "A" }] }],
        [{ type: "heading", depth: 1, text: "B", inline: [{ type: "text", text: "B" }] }],
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
      inline: [{ type: "text", text: `Paragraph ${index} `.repeat(20) }],
    }));

    const pages = paginateSegments(
      [blocks],
      { width: 1080, height: 900 },
      getThemeById("punk"),
      true,
    );

    expect(pages.length).toBeGreaterThan(1);
  });

  it("preserves inline Markdown nodes when text does not need splitting", () => {
    const pages = paginateSegments(
      [
        [
          {
            type: "paragraph",
            text: "Bold",
            inline: [{ type: "strong", children: [{ type: "text", text: "Bold" }] }],
          },
        ],
      ],
      { width: 1080, height: 1440 },
      getThemeById("punk"),
      true,
    );

    expect(pages[0].blocks[0]).toMatchObject({
      inline: [{ type: "strong", children: [{ type: "text", text: "Bold" }] }],
    });
  });

  it("splits long Chinese paragraphs before they overflow a fixed-height page", () => {
    const text =
      "消费购物听到限时优惠最后一天限量发售明明不需要的东西也怕不买就吃亏了。".repeat(
        16,
      );

    const pages = paginateSegments(
      [
        [
          {
            type: "paragraph",
            text,
            inline: [{ type: "text", text }],
          },
        ],
      ],
      { width: 1080, height: 1440 },
      getThemeById("punk"),
      true,
    );

    expect(pages.length).toBeGreaterThan(1);
    expect(
      pages
        .flatMap((page) => page.blocks)
        .map((block) => (block.type === "paragraph" ? block.text : ""))
        .join(""),
    ).toBe(text);
  });
});
