import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const cleanEditorialTheme: ThemeDefinition = {
    id: "clean-editorial",
    name: "清爽杂志",
    description: "杂志式标题和清晰段落，适合观点、书摘和长文拆图。",
    colors: {
      background: "#f4f7fb",
      foreground: "#172033",
      accent: "#2454ff",
      secondary: "#dbe5ff",
      muted: "#e9eef7",
      border: "#172033",
      panel: "#ffffff",
    },
    fontFamily: 'Georgia, "PingFang SC", serif',
    padding: 88,
    baseFontSize: 41,
    lineHeight: 1.56,
    blockGap: 32,
    radius: 10,
    borderWidth: 2,
    syntax: syntax({
      foreground: "#172033",
      accent: "#2454ff",
      secondary: "#dbe5ff",
      muted: "#e9eef7",
      border: "#172033",
      panel: "#ffffff",
    }, 14),
    motif: "grid",
  };
