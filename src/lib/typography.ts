export type FontSizePreset = "small" | "medium" | "large" | "custom";

export type TypographySettings = {
  fontId: string;
  fontSizePreset: FontSizePreset;
  customFontSize: number;
};

export type ResolvedTypography = {
  fontFamily: string;
  fontSize: number;
};

type FontOption = {
  id: string;
  name: string;
  family: string;
};

export const FONT_SIZE_MIN = 32;
export const FONT_SIZE_MAX = 64;

export const fontSizeOptions: Array<{
  value: FontSizePreset;
  label: string;
  size: number;
}> = [
  { value: "small", label: "小", size: 38 },
  { value: "medium", label: "中", size: 44 },
  { value: "large", label: "大", size: 52 },
  { value: "custom", label: "自定义", size: 44 },
];

export const fontOptions: FontOption[] = [
  {
    id: "system-sans",
    name: "默认中文无衬线",
    family: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  {
    id: "system-serif",
    name: "经典中文衬线",
    family: 'Georgia, "Songti SC", "SimSun", serif',
  },
  {
    id: "system-bold",
    name: "醒目黑体",
    family: '"Arial Black", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  {
    id: "like-jianjian",
    name: "栗壳坚坚体",
    family: '"LikeJianJianTi", "PingFang SC", sans-serif',
  },
  {
    id: "xiaolai-mono",
    name: "小赖字体等宽",
    family: '"Xiaolai Mono", "PingFang SC", monospace',
  },
  {
    id: "yozai",
    name: "悠哉字体",
    family: '"Yozai", "PingFang SC", sans-serif',
  },
  {
    id: "tegakizatsu",
    name: "851 手写杂体",
    family: '"851tegakizatsu", "PingFang SC", sans-serif',
  },
  {
    id: "pingfang-zhuifeng",
    name: "平方追风体",
    family: '"PING FANG ZHUI FENG", "PingFang SC", sans-serif',
  },
  {
    id: "jason-handwriting-7",
    name: "清松手写体 7",
    family: '"JasonHandwriting7", "PingFang SC", sans-serif',
  },
];

export const defaultTypography: TypographySettings = {
  fontId: "system-sans",
  fontSizePreset: "medium",
  customFontSize: 44,
};

export function clampFontSize(size: number) {
  if (!Number.isFinite(size)) return defaultTypography.customFontSize;
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(size)));
}

export function isFontSizePreset(value: string): value is FontSizePreset {
  return fontSizeOptions.some((option) => option.value === value);
}

export function isFontId(value: string) {
  return fontOptions.some((option) => option.id === value);
}

export function resolveTypography(settings: TypographySettings): ResolvedTypography {
  const font = fontOptions.find((option) => option.id === settings.fontId) ?? fontOptions[0];
  const preset = fontSizeOptions.find((option) => option.value === settings.fontSizePreset);
  const fontSize =
    settings.fontSizePreset === "custom"
      ? clampFontSize(settings.customFontSize)
      : preset?.size ?? fontSizeOptions[1].size;

  return {
    fontFamily: font.family,
    fontSize,
  };
}
