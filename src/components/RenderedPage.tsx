import type { CSSProperties } from "react";
import {
  ChevronLeft,
  CircleEllipsis,
  ListChecks,
  Paperclip,
  PenLine,
  PenTool,
  Share,
} from "lucide-react";
import { resolveThemeSyntax } from "@/lib/themes";
import { resolveImageSrc } from "@/lib/images";
import type { LocalImageSources } from "@/lib/localImages";
import type {
  Dimensions,
  GeneratedPage,
  MarkdownBlock,
  MarkdownInline,
  ThemeDefinition,
  WatermarkSettings,
} from "@/lib/types";
import type { ResolvedTypography } from "@/lib/typography";

type RenderedPageProps = {
  page: GeneratedPage;
  theme: ThemeDefinition;
  dimensions: Dimensions;
  typography?: ResolvedTypography;
  localImageSources?: LocalImageSources;
  watermark?: WatermarkSettings;
  scale?: number;
};

function renderInline(inline: MarkdownInline[] | undefined, fallback: string, prefix: string) {
  const nodes = inline?.length ? inline : [{ type: "text" as const, text: fallback }];

  return nodes.map((node, index) => {
    const key = `${prefix}-${index}`;
    if (node.type === "text") return <span key={key}>{node.text}</span>;
    if (node.type === "inlineCode") {
      return (
        <code key={key} className="xhs-inline-code">
          {node.code}
        </code>
      );
    }
    if (node.type === "strong") return <strong key={key}>{renderInline(node.children, "", key)}</strong>;
    if (node.type === "emphasis") return <em key={key}>{renderInline(node.children, "", key)}</em>;
    if (node.type === "delete") return <del key={key}>{renderInline(node.children, "", key)}</del>;
    return <mark key={key}>{renderInline(node.children, "", key)}</mark>;
  });
}

function renderBlock(
  block: MarkdownBlock,
  index: number,
  localImageSources: LocalImageSources,
) {
  if (block.type === "heading") {
    const Tag = block.depth === 1 ? "h1" : block.depth === 2 ? "h2" : "h3";
    return <Tag key={index}>{renderInline(block.inline, block.text, `heading-${index}`)}</Tag>;
  }

  if (block.type === "paragraph") {
    return <p key={index}>{renderInline(block.inline, block.text, `paragraph-${index}`)}</p>;
  }

  if (block.type === "quote") {
    return (
      <blockquote key={index}>
        {renderInline(block.inline, block.text, `quote-${index}`)}
      </blockquote>
    );
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag key={index}>
        {block.items.map((item, itemIndex) => (
          <li key={`${item.text}-${itemIndex}`}>
            {renderInline(item.inline, item.text, `list-${index}-${itemIndex}`)}
          </li>
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

  const caption = block.alt.trim();

  return (
    <figure key={index}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={block.alt} src={resolveImageSrc(block.url, localImageSources)} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function IPhoneNotesChrome() {
  return (
    <>
      <div className="iphone-notes-topbar" aria-hidden="true">
        <span className="iphone-notes-back">
          <ChevronLeft />
          备忘录
        </span>
        <span className="iphone-notes-actions">
          <Share />
          <CircleEllipsis />
        </span>
      </div>
      <div className="iphone-notes-bottombar" aria-hidden="true">
        <ListChecks />
        <Paperclip />
        <PenTool />
        <PenLine />
      </div>
    </>
  );
}

export function RenderedPage({
  page,
  theme,
  dimensions,
  typography,
  localImageSources = {},
  watermark,
  scale = 1,
}: RenderedPageProps) {
  const syntax = resolveThemeSyntax(theme);
  const style = {
    "--page-bg": theme.colors.background,
    "--page-ink": theme.colors.foreground,
    "--page-accent": theme.colors.accent,
    "--page-secondary": theme.colors.secondary,
    "--page-muted": theme.colors.muted,
    "--page-border": theme.colors.border,
    "--page-panel": theme.colors.panel,
    "--page-font": typography?.fontFamily ?? theme.fontFamily,
    "--page-padding": `${theme.padding}px`,
    "--page-base": `${typography?.fontSize ?? theme.baseFontSize}px`,
    "--page-line": theme.lineHeight,
    "--page-gap": `${theme.blockGap}px`,
    "--page-radius": `${theme.radius}px`,
    "--page-border-width": `${theme.borderWidth}px`,
    "--syntax-heading-color": syntax.headingColor,
    "--syntax-heading-bg": syntax.headingBackground,
    "--syntax-strong": syntax.strongColor,
    "--syntax-emphasis": syntax.emphasisColor,
    "--syntax-delete": syntax.deleteColor,
    "--syntax-highlight-bg": syntax.highlightBackground,
    "--syntax-highlight": syntax.highlightColor,
    "--syntax-code-bg": syntax.codeBackground,
    "--syntax-code": syntax.codeColor,
    "--syntax-quote-bg": syntax.quoteBackground,
    "--syntax-list-marker": syntax.listMarkerColor,
    "--syntax-image-border": syntax.imageBorderColor,
    "--syntax-image-radius": `${syntax.imageRadius}px`,
    width: dimensions.width,
    height: dimensions.height,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  } as CSSProperties;

  const isIPhoneNotes = theme.id === "iphone-notes";
  const trimmedAuthorName = watermark?.authorName.trim() ?? "";
  const shouldRenderWatermark =
    Boolean(watermark?.enabled) && Boolean(trimmedAuthorName || watermark?.avatarSrc);

  return (
    <article className={`xhs-page theme-${theme.id} motif-${theme.motif}`} style={style}>
      {isIPhoneNotes ? <IPhoneNotesChrome /> : null}
      {shouldRenderWatermark ? (
        <div className="xhs-watermark" aria-label="作者水印">
          {watermark?.avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="xhs-watermark-avatar"
              alt="作者头像"
              src={watermark.avatarSrc}
            />
          ) : null}
          {trimmedAuthorName ? (
            <span className="xhs-watermark-name">{trimmedAuthorName}</span>
          ) : null}
        </div>
      ) : null}
      <div className="xhs-page-inner">
        {page.blocks.length ? (
          page.blocks.map((block, index) => renderBlock(block, index, localImageSources))
        ) : (
          <p>开始写 Markdown，预览会实时出现在这里。</p>
        )}
      </div>
    </article>
  );
}
