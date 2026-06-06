import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./markdown";
import { SAMPLE_MARKDOWN } from "./sample";

describe("SAMPLE_MARKDOWN", () => {
  it("shows a two-page Beijing travel guide with common Markdown formats", () => {
    const pages = parseMarkdown(SAMPLE_MARKDOWN);
    const blocks = pages.flat();
    const images = blocks.filter((block) => block.type === "image");

    expect(pages).toHaveLength(2);
    expect(images).toHaveLength(2);
    expect(images.every((image) => image.url.startsWith("https://r1.visitbeijing.com.cn/"))).toBe(
      true,
    );
    expect(blocks.some((block) => block.type === "heading" && block.depth === 1)).toBe(true);
    expect(blocks.some((block) => block.type === "heading" && block.depth === 2)).toBe(true);
    expect(blocks.some((block) => block.type === "list" && block.ordered)).toBe(true);
    expect(blocks.some((block) => block.type === "list" && !block.ordered)).toBe(true);
    expect(blocks.some((block) => block.type === "quote")).toBe(true);
    expect(blocks.some((block) => block.type === "code")).toBe(true);
  });
});
