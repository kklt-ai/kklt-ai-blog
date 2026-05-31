import { describe, expect, it } from "vitest";
import { parseMarkdownSegment, splitManualSegments } from "./markdown";

describe("splitManualSegments", () => {
  it("splits only on standalone Markdown dividers", () => {
    expect(splitManualSegments("A\n\n---\n\nB")).toEqual(["A", "B"]);
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
      "Plain **bold** *italic* ~~deleted~~ ==marked== <u>underlined</u> ++also underlined++ `code`",
    );

    expect(paragraph).toEqual({
      type: "paragraph",
      text: "Plain bold italic deleted marked underlined also underlined code",
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
        { type: "underline", children: [{ type: "text", text: "underlined" }] },
        { type: "text", text: " " },
        { type: "underline", children: [{ type: "text", text: "also underlined" }] },
        { type: "text", text: " " },
        { type: "inlineCode", code: "code" },
      ],
    });
  });

  it("treats standalone image URLs and paths as image blocks", () => {
    expect(
      parseMarkdownSegment(
        "https://cdn.nlark.com/yuque/0/2026/png/12544572/1780106214842-787a9e0c-4529-46f7-9c41-804e0406e210.png",
      ),
    ).toEqual([
      {
        type: "image",
        alt: "",
        url: "https://cdn.nlark.com/yuque/0/2026/png/12544572/1780106214842-787a9e0c-4529-46f7-9c41-804e0406e210.png",
      },
    ]);

    expect(parseMarkdownSegment("./images/photo.webp")).toEqual([
      { type: "image", alt: "", url: "./images/photo.webp" },
    ]);
  });
});
