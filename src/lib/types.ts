export type Dimensions = {
  width: number;
  height: number;
};

export type MarkdownInline =
  | { type: "text"; text: string }
  | { type: "strong" | "emphasis" | "delete" | "mark" | "underline"; children: MarkdownInline[] }
  | { type: "inlineCode"; code: string };

export type MarkdownListItem = {
  text: string;
  inline: MarkdownInline[];
};

export type MarkdownBlock =
  | { type: "heading"; depth: 1 | 2 | 3; text: string; inline: MarkdownInline[] }
  | { type: "paragraph"; text: string; inline: MarkdownInline[] }
  | { type: "list"; ordered: boolean; items: MarkdownListItem[] }
  | { type: "quote"; text: string; inline: MarkdownInline[] }
  | { type: "code"; language?: string; code: string }
  | { type: "image"; alt: string; url: string };

export type GeneratedPage = {
  id: string;
  manualGroupIndex: number;
  blocks: MarkdownBlock[];
  estimatedHeight: number;
};

export type WatermarkSettings = {
  enabled: boolean;
  authorName: string;
  avatarSrc: string | null;
};

export type ThemeDefinition = {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    secondary: string;
    muted: string;
    border: string;
    panel: string;
  };
  fontFamily: string;
  padding: number;
  baseFontSize: number;
  lineHeight: number;
  blockGap: number;
  radius: number;
  borderWidth: number;
  syntax: ThemeSyntaxStyles;
  motif: "none" | "dots" | "grid" | "burst" | "notes" | "memphis" | "notebook-grid";
};

export type ThemeSyntaxStyles = {
  headingColor: string;
  headingBackground: string;
  strongColor: string;
  emphasisColor: string;
  deleteColor: string;
  highlightBackground: string;
  highlightColor: string;
  codeBackground: string;
  codeColor: string;
  quoteBackground: string;
  listMarkerColor: string;
  imageBorderColor: string;
  imageRadius: number;
};

export type ThemeSyntaxOverrides = Partial<ThemeSyntaxStyles>;
