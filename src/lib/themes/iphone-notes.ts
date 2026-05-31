import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const iphoneNotesTheme: ThemeDefinition = {
    id: "iphone-notes",
    name: "iPhone 备忘录",
    description: "白底、黄工具栏和系统排版，像在手机备忘录里写字。",
    colors: {
      background: "#ffffff",
      foreground: "#1d1d1f",
      accent: "#f2b90f",
      secondary: "#f2b90f",
      muted: "#f5f5f7",
      border: "#d1d1d6",
      panel: "#ffffff",
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    padding: 170,
    baseFontSize: 47,
    lineHeight: 1.58,
    blockGap: 26,
    radius: 30,
    borderWidth: 0,
    syntax: syntax({
      foreground: "#1d1d1f",
      accent: "#f2b90f",
      secondary: "#f2b90f",
      muted: "#f5f5f7",
      border: "#d1d1d6",
      panel: "#ffffff",
    }, 18),
    motif: "notes",
  };
