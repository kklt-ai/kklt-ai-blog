import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const highContrastPosterTheme: ThemeDefinition = {
    id: "high-contrast-poster",
    name: "高对比海报",
    description: "黑白底色和强烈强调色，适合标题党和重点总结。",
    colors: {
      background: "#111111",
      foreground: "#ffffff",
      accent: "#ffdf00",
      secondary: "#ff4f5e",
      muted: "#2a2a2a",
      border: "#ffffff",
      panel: "#181818",
    },
    fontFamily: 'Arial Black, Arial, "PingFang SC", sans-serif',
    padding: 82,
    baseFontSize: 42,
    lineHeight: 1.45,
    blockGap: 34,
    radius: 0,
    borderWidth: 5,
    syntax: syntax({
      foreground: "#ffffff",
      accent: "#ffdf00",
      secondary: "#ff4f5e",
      muted: "#2a2a2a",
      border: "#ffffff",
      panel: "#181818",
    }, 0),
    motif: "grid",
  };
