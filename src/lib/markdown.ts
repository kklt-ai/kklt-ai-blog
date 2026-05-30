import type { Blockquote, Code, Heading, Image, List, Paragraph, Root } from "mdast";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import type { MarkdownBlock, MarkdownInline, MarkdownListItem } from "./types";

type TextLikeNode = {
  type?: string;
  value?: string;
  alt?: string | null;
  url?: string;
  children?: TextLikeNode[];
};

export function splitManualSegments(markdown: string): string[] {
  return markdown
    .split(/\n\s*-{3,}\s*\n/g)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function textFromChildren(children: readonly TextLikeNode[] = []): string {
  return inlineText(inlineFromChildren(children)).trim();
}

function inlineText(inline: readonly MarkdownInline[]): string {
  return inline
    .map((node) => {
      if (node.type === "text") return node.text;
      if (node.type === "inlineCode") return node.code;
      return inlineText(node.children);
    })
    .join("");
}

function highlightFromText(text: string): MarkdownInline[] {
  const inline: MarkdownInline[] = [];
  const pattern = /==([^=]+)==/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      inline.push({ type: "text", text: text.slice(cursor, match.index) });
    }
    inline.push({ type: "mark", children: [{ type: "text", text: match[1] }] });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    inline.push({ type: "text", text: text.slice(cursor) });
  }

  return inline;
}

function inlineFromNode(node: TextLikeNode): MarkdownInline[] {
  if (node.type === "text" && typeof node.value === "string") {
    return highlightFromText(node.value);
  }

  if (node.type === "inlineCode" && typeof node.value === "string") {
    return [{ type: "inlineCode", code: node.value }];
  }

  if (node.type === "break") {
    return [{ type: "text", text: "\n" }];
  }

  if (
    (node.type === "strong" ||
      node.type === "emphasis" ||
      node.type === "delete") &&
    Array.isArray(node.children)
  ) {
    return [{ type: node.type, children: inlineFromChildren(node.children) }];
  }

  if (typeof node.alt === "string" && node.alt.length > 0) {
    return [{ type: "text", text: node.alt }];
  }

  if (Array.isArray(node.children)) {
    return inlineFromChildren(node.children);
  }

  if (typeof node.value === "string") {
    return highlightFromText(node.value);
  }

  return [];
}

function inlineFromChildren(children: readonly TextLikeNode[] = []): MarkdownInline[] {
  return children.flatMap(inlineFromNode);
}

function isImageOnlyParagraph(paragraph: Paragraph): Image | null {
  if (paragraph.children.length !== 1) return null;
  const child = paragraph.children[0];
  return child.type === "image" ? (child as Image) : null;
}

function isStandaloneImageSource(text: string) {
  return /^(?:https?:\/\/|file:\/\/|\.{1,2}\/|\/|[A-Za-z]:\\|[^\s()[\]<>]+\/)?[^\s()[\]<>]+\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#][^\s()[\]<>]*)?$/i.test(
    text,
  );
}

export function parseMarkdownSegment(markdown: string): MarkdownBlock[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const blocks: MarkdownBlock[] = [];

  for (const node of tree.children) {
    if (node.type === "heading") {
      const heading = node as Heading;
      const inline = inlineFromChildren(heading.children as TextLikeNode[]);
      blocks.push({
        type: "heading",
        depth: Math.min(3, heading.depth) as 1 | 2 | 3,
        text: inlineText(inline).trim(),
        inline,
      });
      continue;
    }

    if (node.type === "paragraph") {
      const paragraph = node as Paragraph;
      const image = isImageOnlyParagraph(paragraph);
      if (image) {
        blocks.push({ type: "image", alt: image.alt ?? "", url: image.url });
      } else {
        const inline = inlineFromChildren(paragraph.children as TextLikeNode[]);
        const text = inlineText(inline).trim();
        if (isStandaloneImageSource(text)) {
          blocks.push({ type: "image", alt: "", url: text });
          continue;
        }
        blocks.push({
          type: "paragraph",
          text,
          inline,
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
          .map((item): MarkdownListItem => {
            const inline = inlineFromChildren(item.children as TextLikeNode[]);
            return { text: inlineText(inline).trim(), inline };
          })
          .filter((item) => item.text.length > 0),
      });
      continue;
    }

    if (node.type === "blockquote") {
      const blockquote = node as Blockquote;
      const inline = inlineFromChildren(blockquote.children as TextLikeNode[]);
      blocks.push({
        type: "quote",
        text: inlineText(inline).trim(),
        inline,
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
