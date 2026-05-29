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
      { type: "heading", depth: 1, text: "Title", inline: [{ type: "text", text: "Title" }] },
      {
        type: "paragraph",
        text: "Paragraph text",
        inline: [{ type: "text", text: "Paragraph text" }],
      },
      {
        type: "list",
        ordered: false,
        items: [
          { text: "one", inline: [{ type: "text", text: "one" }] },
          { text: "two", inline: [{ type: "text", text: "two" }] },
        ],
      },
      { type: "quote", text: "quote", inline: [{ type: "text", text: "quote" }] },
      { type: "code", language: "ts", code: "const x = 1;" },
      { type: "image", alt: "Alt", url: "https://example.com/a.png" },
    ]);
  });

  it("preserves inline Markdown syntax for themed rendering", () => {
    const [paragraph] = parseMarkdownSegment(
      "Plain **bold** *italic* ~~deleted~~ ==marked== `code`",
    );

    expect(paragraph).toEqual({
      type: "paragraph",
      text: "Plain bold italic deleted marked code",
      inline: [
        { type: "text", text: "Plain " },
        { type: "strong", children: [{ type: "text", text: "bold" }] },
        { type: "text", text: " " },
        { type: "emphasis", children: [{ type: "text", text: "italic" }] },
        { type: "text", text: " " },
        { type: "delete", children: [{ type: "text", text: "deleted" }] },
        { type: "text", text: " " },
        { type: "mark", children: [{ type: "text", text: "marked" }] },
        { type: "text", text: " " },
        { type: "inlineCode", code: "code" },
      ],
    });
  });
});
