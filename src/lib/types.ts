export type Dimensions = {
  width: number;
  height: number;
};

export type MarkdownBlock =
  | { type: "heading"; depth: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; language?: string; code: string }
  | { type: "image"; alt: string; url: string };

export type GeneratedPage = {
  id: string;
  manualGroupIndex: number;
  blocks: MarkdownBlock[];
  estimatedHeight: number;
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
  motif: "none" | "dots" | "grid" | "burst" | "notes" | "memphis";
};
