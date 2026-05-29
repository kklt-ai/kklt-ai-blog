import { describe, expect, it } from "vitest";
import { parseMarkdownSegment, splitManualSegments } from "./markdown";

describe("splitManualSegments", () => {
  it("splits only on standalone seven-dash dividers", () => {
    expect(splitManualSegments("A\n\n-------\n\nB")).toEqual(["A", "B"]);
    expect(splitManualSegments("A ------- B")).toEqual(["A ------- B"]);
  });
});

describe("parseMarkdownSegment", () => {
  it("parses supported Markdown block types", () => {
    const blocks = parseMarkdownSegment(`# Title

Paragraph text

- one
- two

> quote

\`\`\`ts
const x = 1;
\`\`\`

![Alt](https://example.com/a.png)`);

    expect(blocks).toEqual([
      { type: "heading", depth: 1, text: "Title" },
      { type: "paragraph", text: "Paragraph text" },
      { type: "list", ordered: false, items: ["one", "two"] },
      { type: "quote", text: "quote" },
      { type: "code", language: "ts", code: "const x = 1;" },
      { type: "image", alt: "Alt", url: "https://example.com/a.png" },
    ]);
  });
});
