import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const memphisTheme: ThemeDefinition = {
    id: "memphis",
    name: "孟菲斯",
    description: "几何图形、活泼色彩和拼贴感，适合灵感型笔记。",
    colors: {
      background: "#fff9f0",
      foreground: "#1a1a1a",
      accent: "#ff6b6b",
      secondary: "#4ecdc4",
      muted: "#ffe66d",
      border: "#1a1a1a",
      panel: "#ffffff",
    },
    fontFamily: '"Trebuchet MS", Arial, "PingFang SC", sans-serif',
    padding: 88,
    baseFontSize: 42,
    lineHeight: 1.5,
    blockGap: 32,
    radius: 18,
    borderWidth: 6,
    syntax: syntax({
      foreground: "#1a1a1a",
      accent: "#ff6b6b",
      secondary: "#4ecdc4",
      muted: "#ffe66d",
      border: "#1a1a1a",
      panel: "#ffffff",
    }, 20),
    motif: "memphis",
  };
