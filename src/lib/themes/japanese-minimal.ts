import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const japaneseMinimalTheme: ThemeDefinition = {
    id: "japanese-minimal",
    name: "日式极简",
    description: "留白、低饱和与克制层级，适合知识卡片和生活方式内容。",
    colors: {
      background: "#f7f1e6",
      foreground: "#27221c",
      accent: "#b63d32",
      secondary: "#ded2bd",
      muted: "#eee3d1",
      border: "#27221c",
      panel: "#fffaf1",
    },
    fontFamily: '"Hiragino Sans", "PingFang SC", serif',
    padding: 104,
    baseFontSize: 40,
    lineHeight: 1.62,
    blockGap: 30,
    radius: 2,
    borderWidth: 2,
    syntax: syntax({
      foreground: "#27221c",
      accent: "#b63d32",
      secondary: "#ded2bd",
      muted: "#eee3d1",
      border: "#27221c",
      panel: "#fffaf1",
    }, 2),
    motif: "none",
  };
