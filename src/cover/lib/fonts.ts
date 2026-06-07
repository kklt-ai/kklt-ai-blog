import type { CoverFontFamily } from "./types";

export const COVER_FONT_FAMILIES: Array<{
  id: CoverFontFamily;
  name: string;
  css: string;
}> = [
  {
    id: "system",
    name: "现代黑体",
    css: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  {
    id: "serif",
    name: "杂志宋体",
    css: "Georgia, 'Songti SC', 'SimSun', serif",
  },
  {
    id: "rounded",
    name: "圆润标题",
    css: "'Arial Rounded MT Bold', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  {
    id: "mono",
    name: "科技等宽",
    css: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
  },
];

export function fontFamilyCss(fontFamily: CoverFontFamily) {
  return (
    COVER_FONT_FAMILIES.find((font) => font.id === fontFamily)?.css ??
    COVER_FONT_FAMILIES[0].css
  );
}
