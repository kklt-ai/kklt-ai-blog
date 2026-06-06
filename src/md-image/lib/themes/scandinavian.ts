import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const scandinavianTheme: ThemeDefinition = {
    id: "scandinavian",
    name: "斯堪的纳维亚",
    description: "明亮白底、浅蓝木色和温和几何，适合生活方式内容。",
    colors: {
      background: "#f8fbfc",
      foreground: "#23313a",
      accent: "#7ca6b8",
      secondary: "#d9c8ad",
      muted: "#eef3f4",
      border: "#b9c9cf",
      panel: "#ffffff",
    },
    fontFamily: 'Futura, "Avenir Next", Arial, "PingFang SC", sans-serif',
    padding: 94,
    baseFontSize: 40,
    lineHeight: 1.58,
    blockGap: 30,
    radius: 16,
    borderWidth: 2,
    syntax: syntax({
      foreground: "#23313a",
      accent: "#7ca6b8",
      secondary: "#d9c8ad",
      muted: "#eef3f4",
      border: "#b9c9cf",
      panel: "#ffffff",
    }, 18),
    motif: "memphis",
  };
