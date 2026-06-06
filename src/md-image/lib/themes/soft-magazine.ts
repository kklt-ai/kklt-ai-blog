import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const softMagazineTheme: ThemeDefinition = {
    id: "soft-magazine",
    name: "柔和画报",
    description: "轻盈色彩和画报式卡片，适合情绪、穿搭和清单内容。",
    colors: {
      background: "#ffe8ef",
      foreground: "#2e2430",
      accent: "#e84a7f",
      secondary: "#8bd3dd",
      muted: "#fff6f8",
      border: "#2e2430",
      panel: "#fffdfb",
    },
    fontFamily: '"Avenir Next", Arial, "PingFang SC", sans-serif',
    padding: 86,
    baseFontSize: 41,
    lineHeight: 1.55,
    blockGap: 32,
    radius: 24,
    borderWidth: 3,
    syntax: syntax({
      foreground: "#2e2430",
      accent: "#e84a7f",
      secondary: "#8bd3dd",
      muted: "#fff6f8",
      border: "#2e2430",
      panel: "#fffdfb",
    }, 24),
    motif: "dots",
  };
