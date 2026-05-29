import type { Dimensions, GeneratedPage, MarkdownBlock, ThemeDefinition } from "./types";

function estimateBlockHeight(
  block: MarkdownBlock,
  theme: ThemeDefinition,
  contentWidth: number,
) {
  const charsPerLine = Math.max(12, Math.floor(contentWidth / (theme.baseFontSize * 0.58)));

  if (block.type === "heading") {
    const scale = block.depth === 1 ? 1.9 : block.depth === 2 ? 1.45 : 1.2;
    const lines = Math.max(1, Math.ceil(block.text.length / charsPerLine));
    return lines * theme.baseFontSize * theme.lineHeight * scale + theme.blockGap;
  }

  if (block.type === "paragraph" || block.type === "quote") {
    const lines = Math.max(1, Math.ceil(block.text.length / charsPerLine));
    return lines * theme.baseFontSize * theme.lineHeight + theme.blockGap;
  }

  if (block.type === "list") {
    const lines = block.items.reduce(
      (total, item) =>
        total + Math.max(1, Math.ceil(item.length / Math.max(8, charsPerLine - 4))),
      0,
    );
    return lines * theme.baseFontSize * theme.lineHeight + theme.blockGap;
  }

  if (block.type === "code") {
    const lines = Math.max(1, block.code.split("\n").length);
    return lines * theme.baseFontSize * 1.45 + theme.blockGap + 24;
  }

  return Math.min(360, Math.max(180, contentWidth * 0.55)) + theme.blockGap;
}

function splitOversizedTextBlock(
  block: MarkdownBlock,
  theme: ThemeDefinition,
  contentWidth: number,
  maxHeight: number,
) {
  if (block.type !== "paragraph" && block.type !== "quote" && block.type !== "code") {
    return [block];
  }

  const sourceText = block.type === "code" ? block.code : block.text;
  const pieces = block.type === "code" ? sourceText.split("\n") : Array.from(sourceText);
  const joiner = block.type === "code" ? "\n" : "";
  const chunks: MarkdownBlock[] = [];
  let current = "";

  for (const piece of pieces) {
    const next = current ? `${current}${joiner}${piece}` : piece;
    const nextBlock =
      block.type === "code" ? { ...block, code: next } : { ...block, text: next };

    if (current && estimateBlockHeight(nextBlock, theme, contentWidth) > maxHeight) {
      chunks.push(block.type === "code" ? { ...block, code: current } : { ...block, text: current });
      current = piece;
    } else {
      current = next;
    }
  }

  if (current) {
    chunks.push(block.type === "code" ? { ...block, code: current } : { ...block, text: current });
  }

  return chunks;
}

export function paginateSegments(
  segments: MarkdownBlock[][],
  dimensions: Dimensions,
  theme: ThemeDefinition,
  autoPaginate: boolean,
): GeneratedPage[] {
  const contentWidth = dimensions.width - theme.padding * 2;
  const contentHeight = dimensions.height - theme.padding * 2;
  const pages: GeneratedPage[] = [];

  segments.forEach((segment, manualGroupIndex) => {
    let pageBlocks: MarkdownBlock[] = [];
    let pageHeight = 0;

    const flush = () => {
      pages.push({
        id: `page-${pages.length + 1}`,
        manualGroupIndex,
        blocks: pageBlocks,
        estimatedHeight: pageHeight,
      });
      pageBlocks = [];
      pageHeight = 0;
    };

    const sourceBlocks = autoPaginate
      ? segment.flatMap((block) =>
          splitOversizedTextBlock(block, theme, contentWidth, contentHeight),
        )
      : segment;

    for (const block of sourceBlocks) {
      const blockHeight = estimateBlockHeight(block, theme, contentWidth);
      if (autoPaginate && pageBlocks.length > 0 && pageHeight + blockHeight > contentHeight) {
        flush();
      }
      pageBlocks.push(block);
      pageHeight += blockHeight;
    }

    if (pageBlocks.length > 0 || segment.length === 0) {
      flush();
    }
  });

  return pages.length
    ? pages
    : [{ id: "page-1", manualGroupIndex: 0, blocks: [], estimatedHeight: 0 }];
}
