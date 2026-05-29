import type { CSSProperties } from "react";
import type { Dimensions, GeneratedPage, MarkdownBlock, ThemeDefinition } from "@/lib/types";

type RenderedPageProps = {
  page: GeneratedPage;
  theme: ThemeDefinition;
  dimensions: Dimensions;
  scale?: number;
};

function renderBlock(block: MarkdownBlock, index: number) {
  if (block.type === "heading") {
    const Tag = block.depth === 1 ? "h1" : block.depth === 2 ? "h2" : "h3";
    return <Tag key={index}>{block.text}</Tag>;
  }

  if (block.type === "paragraph") {
    return <p key={index}>{block.text}</p>;
  }

  if (block.type === "quote") {
    return <blockquote key={index}>{block.text}</blockquote>;
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag key={index}>
        {block.items.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>{item}</li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "code") {
    return (
      <pre key={index}>
        <code>{block.code}</code>
      </pre>
    );
  }

  return (
    <figure key={index}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={block.alt} src={block.url} />
      <figcaption>{block.alt || "Markdown 图片"}</figcaption>
    </figure>
  );
}

export function RenderedPage({ page, theme, dimensions, scale = 1 }: RenderedPageProps) {
  const style = {
    "--page-bg": theme.colors.background,
    "--page-ink": theme.colors.foreground,
    "--page-accent": theme.colors.accent,
    "--page-secondary": theme.colors.secondary,
    "--page-muted": theme.colors.muted,
    "--page-border": theme.colors.border,
    "--page-panel": theme.colors.panel,
    "--page-font": theme.fontFamily,
    "--page-padding": `${theme.padding}px`,
    "--page-base": `${theme.baseFontSize}px`,
    "--page-line": theme.lineHeight,
    "--page-gap": `${theme.blockGap}px`,
    "--page-radius": `${theme.radius}px`,
    "--page-border-width": `${theme.borderWidth}px`,
    width: dimensions.width,
    height: dimensions.height,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  } as CSSProperties;

  return (
    <article className={`xhs-page motif-${theme.motif}`} style={style}>
      <div className="xhs-page-inner">
        {page.blocks.length ? (
          page.blocks.map(renderBlock)
        ) : (
          <p>开始写 Markdown，预览会实时出现在这里。</p>
        )}
      </div>
    </article>
  );
}
