import type { Dimensions, GeneratedPage, MarkdownBlock, ThemeDefinition } from "./types";

const CJK_OR_FULL_WIDTH_PATTERN =
  /[\u1100-\u115f\u2329\u232a\u2e80-\u303e\u3040-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe6f\uff00-\uff60\uffe0-\uffe6]/;

function estimateTextUnits(text: string) {
  return Array.from(text).reduce((total, char) => {
    if (char === "\n") return total;
    if (/\s/.test(char)) return total + 0.32;
    if (CJK_OR_FULL_WIDTH_PATTERN.test(char)) return total + 1;
    return total + 0.56;
  }, 0);
}

function estimateTextLines(text: string, fontSize: number, contentWidth: number) {
  const unitsPerLine = Math.max(1, contentWidth / fontSize);
  const lines = text.split("\n");

  return lines.reduce(
    (total, line) => total + Math.max(1, Math.ceil(estimateTextUnits(line) / unitsPerLine)),
    0,
  );
}

function estimateBlockHeight(
  block: MarkdownBlock,
  theme: ThemeDefinition,
  contentWidth: number,
) {
  if (block.type === "heading") {
    const scale = block.depth === 1 ? 1.9 : block.depth === 2 ? 1.45 : 1.2;
    const lines = estimateTextLines(block.text, theme.baseFontSize * scale, contentWidth);
    return lines * theme.baseFontSize * theme.lineHeight * scale + theme.blockGap;
  }

  if (block.type === "paragraph" || block.type === "quote") {
    const lines = estimateTextLines(block.text, theme.baseFontSize, contentWidth);
    return lines * theme.baseFontSize * theme.lineHeight + theme.blockGap;
  }

  if (block.type === "list") {
    const listContentWidth = contentWidth - theme.baseFontSize * 1.6;
    const lines = block.items.reduce(
      (total, item) =>
        total + estimateTextLines(item.text, theme.baseFontSize, listContentWidth),
      0,
    );
    return lines * theme.baseFontSize * theme.lineHeight + theme.blockGap;
  }

  if (block.type === "code") {
    const lines = Math.max(1, block.code.split("\n").length);
    return lines * theme.baseFontSize * 1.45 + theme.blockGap + 24;
  }

  if (block.type === "table") {
    const columnCount = Math.max(1, block.headers.length);
    const cellWidth = contentWidth / columnCount - theme.baseFontSize * 0.7;
    const rows = [block.headers, ...block.rows];
    const tableHeight = rows.reduce((total, row) => {
      const rowLines = Math.max(
        1,
        ...row.map((cell) => estimateTextLines(cell.text, theme.baseFontSize * 0.8, cellWidth)),
      );
      return total + rowLines * theme.baseFontSize * theme.lineHeight * 0.82;
    }, theme.baseFontSize * 0.7);

    return tableHeight + theme.blockGap;
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
  if (estimateBlockHeight(block, theme, contentWidth) <= maxHeight) {
    return [block];
  }

  const pieces = block.type === "code" ? sourceText.split("\n") : Array.from(sourceText);
  const joiner = block.type === "code" ? "\n" : "";
  const chunks: MarkdownBlock[] = [];
  let current = "";

  for (const piece of pieces) {
    const next = current ? `${current}${joiner}${piece}` : piece;
    const nextBlock =
      block.type === "code"
        ? { ...block, code: next }
        : { ...block, text: next, inline: [{ type: "text" as const, text: next }] };

    if (current && estimateBlockHeight(nextBlock, theme, contentWidth) > maxHeight) {
      chunks.push(
        block.type === "code"
          ? { ...block, code: current }
          : { ...block, text: current, inline: [{ type: "text", text: current }] },
      );
      current = piece;
    } else {
      current = next;
    }
  }

  if (current) {
    chunks.push(
      block.type === "code"
        ? { ...block, code: current }
        : { ...block, text: current, inline: [{ type: "text", text: current }] },
    );
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
  const contentHeight = dimensions.height - theme.padding * 2 - theme.borderWidth * 2;
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
