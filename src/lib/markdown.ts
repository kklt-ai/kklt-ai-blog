import type { Blockquote, Code, Heading, Image, List, Paragraph, Root } from "mdast";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import type { MarkdownBlock } from "./types";

type TextLikeNode = {
  value?: string;
  alt?: string | null;
  url?: string;
  children?: TextLikeNode[];
};

export function splitManualSegments(markdown: string): string[] {
  return markdown
    .split(/\n\s*-------\s*\n/g)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function textFromChildren(children: readonly TextLikeNode[] = []): string {
  return children
    .map((child) => {
      if (typeof child.value === "string") return child.value;
      if (typeof child.alt === "string" && child.alt.length > 0) return child.alt;
      if (Array.isArray(child.children)) return textFromChildren(child.children);
      return "";
    })
    .join("")
    .trim();
}

function isImageOnlyParagraph(paragraph: Paragraph): Image | null {
  if (paragraph.children.length !== 1) return null;
  const child = paragraph.children[0];
  return child.type === "image" ? (child as Image) : null;
}

export function parseMarkdownSegment(markdown: string): MarkdownBlock[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const blocks: MarkdownBlock[] = [];

  for (const node of tree.children) {
    if (node.type === "heading") {
      const heading = node as Heading;
      blocks.push({
        type: "heading",
        depth: Math.min(3, heading.depth) as 1 | 2 | 3,
        text: textFromChildren(heading.children as TextLikeNode[]),
      });
      continue;
    }

    if (node.type === "paragraph") {
      const paragraph = node as Paragraph;
      const image = isImageOnlyParagraph(paragraph);
      if (image) {
        blocks.push({ type: "image", alt: image.alt ?? "", url: image.url });
      } else {
        blocks.push({
          type: "paragraph",
          text: textFromChildren(paragraph.children as TextLikeNode[]),
        });
      }
      continue;
    }

    if (node.type === "list") {
      const list = node as List;
      blocks.push({
        type: "list",
        ordered: Boolean(list.ordered),
        items: list.children
          .map((item) => textFromChildren(item.children as TextLikeNode[]))
          .filter(Boolean),
      });
      continue;
    }

    if (node.type === "blockquote") {
      const blockquote = node as Blockquote;
      blocks.push({
        type: "quote",
        text: textFromChildren(blockquote.children as TextLikeNode[]),
      });
      continue;
    }

    if (node.type === "code") {
      const code = node as Code;
      blocks.push({
        type: "code",
        language: code.lang ?? undefined,
        code: code.value.trim(),
      });
    }
  }

  return blocks.filter((block) => {
    if (block.type === "list") return block.items.length > 0;
    if (block.type === "code") return block.code.length > 0;
    if (block.type === "image") return block.url.length > 0;
    return block.text.length > 0;
  });
}

export function parseMarkdown(markdown: string): MarkdownBlock[][] {
  const segments = splitManualSegments(markdown);
  return (segments.length ? segments : [markdown]).map(parseMarkdownSegment);
}
