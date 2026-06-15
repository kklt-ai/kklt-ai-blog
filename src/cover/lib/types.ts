export type CoverChannelId = "xiaohongshu" | "wechat";

export type CoverChannel = {
  id: CoverChannelId;
  name: string;
  sizeLabel: string;
  brandColor: string;
  brandForeground: string;
  width: number;
  height: number;
};

export type CoverBackgroundFit = "cover" | "contain";

export type BrandIconId =
  | "alibaba"
  | "codex"
  | "openai"
  | "anthropic"
  | "antigravity"
  | "apple"
  | "baidu"
  | "capcut"
  | "claudecode"
  | "cline"
  | "cursor"
  | "deepseek"
  | "dify"
  | "figma"
  | "github"
  | "google"
  | "grok"
  | "huawei"
  | "jimeng"
  | "kiro"
  | "moonshot"
  | "nanobanana"
  | "notion"
  | "qoder";

export type TextAlign = "left" | "center" | "right";
export type CoverFontFamily = "system" | "serif" | "rounded" | "mono";
export type CoverTextEffect =
  | "none"
  | "outline"
  | "outline-white"
  | "outline-warm"
  | "outline-red"
  | "outline-blue"
  | "outline-lime"
  | "shadow"
  | "shadow-speed"
  | "shadow-soft"
  | "shadow-yellow"
  | "shadow-scan"
  | "shadow-poster"
  | "texture-ice"
  | "texture-gold"
  | "texture-blue"
  | "texture-stripe"
  | "texture-copper"
  | "texture-comic"
  | "gradient"
  | "gradient-silver"
  | "gradient-red-black"
  | "gradient-outline"
  | "gradient-peach"
  | "gradient-sun"
  | "glow"
  | "glow-red"
  | "glow-outline"
  | "glow-indigo"
  | "glow-lime"
  | "glow-pink"
  | "three-d-blue"
  | "three-d-violet"
  | "three-d-cyan"
  | "three-d-orange"
  | "three-d-wire"
  | "three-d-yellow";

export type CoverTextHighlightEffect =
  | "none"
  | "highlight-ring-yellow"
  | "highlight-ring-pink"
  | "highlight-diamond-red"
  | "highlight-marker-yellow"
  | "highlight-pill-cyan"
  | "highlight-bubble-pink"
  | "highlight-bubble-blue"
  | "highlight-block-green"
  | "highlight-bottom-yellow"
  | "highlight-bottom-green"
  | "highlight-bottom-pill"
  | "highlight-strike-orange";

export type CoverTextLayer = {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  color: string;
  fontFamily: CoverFontFamily;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  textEffect?: CoverTextEffect;
  highlightEffect?: CoverTextHighlightEffect;
};

export type CoverIconLayer = {
  id: string;
  type: "icon";
  iconId: BrandIconId;
  x: number;
  y: number;
  size: number;
};

export type CoverImageLayer = {
  id: string;
  type: "image";
  src: string;
  alt: string;
  x: number;
  y: number;
  width: number;
};

export type CoverLayer = CoverTextLayer | CoverIconLayer | CoverImageLayer;

export type CoverTemplate = {
  id: string;
  name: string;
  channel: CoverChannelId;
  description: string;
  backgroundClassName: string;
  backgroundImageId?: string;
  layers: CoverLayer[];
};

export type CoverBackgroundImage = {
  id: string;
  name: string;
  channel: CoverChannelId;
  src: string;
  fit?: CoverBackgroundFit;
};

export type BrandIcon = {
  id: BrandIconId;
  name: string;
  mark: string;
  className: string;
  src?: string;
};
