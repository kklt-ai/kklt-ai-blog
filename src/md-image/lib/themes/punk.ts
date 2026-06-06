import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const punkTheme: ThemeDefinition = {
    id: "punk",
    name: "朋克风格",
    description: "高对比、粗边框、荧光撞色，适合强观点内容。",
    colors: {
      background: "#fef15a",
      foreground: "#111111",
      accent: "#ff4fb3",
      secondary: "#00b7ff",
      muted: "#fff6b8",
      border: "#111111",
      panel: "#ffffff",
    },
    fontFamily: 'Arial, "PingFang SC", sans-serif',
    padding: 92,
    baseFontSize: 44,
    lineHeight: 1.45,
    blockGap: 34,
    radius: 0,
    borderWidth: 8,
    syntax: syntax({
      foreground: "#111111",
      accent: "#ff4fb3",
      secondary: "#00b7ff",
      muted: "#fff6b8",
      border: "#111111",
      panel: "#ffffff",
    }, 0),
    motif: "burst",
  };
