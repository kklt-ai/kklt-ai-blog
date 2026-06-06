import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const elegantVintageTheme: ThemeDefinition = {
    id: "elegant-vintage",
    name: "优雅复古",
    description: "旧纸质感、深棕红和衬线排版，适合书摘与历史内容。",
    colors: {
      background: "#f2e4c8",
      foreground: "#382617",
      accent: "#8f2f24",
      secondary: "#d8bf93",
      muted: "#ead7b4",
      border: "#5f4328",
      panel: "#fff3d8",
    },
    fontFamily: 'Baskerville, Georgia, "Songti SC", serif',
    padding: 96,
    baseFontSize: 41,
    lineHeight: 1.62,
    blockGap: 31,
    radius: 8,
    borderWidth: 3,
    syntax: syntax({
      foreground: "#382617",
      accent: "#8f2f24",
      secondary: "#d8bf93",
      muted: "#ead7b4",
      border: "#5f4328",
      panel: "#fff3d8",
    }, 12),
    motif: "grid",
  };
