import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const popArtTheme: ThemeDefinition = {
    id: "pop-art",
    name: "波普艺术",
    description: "明亮色块和圆点图案，适合清单、教程和轻松表达。",
    colors: {
      background: "#ffeb3b",
      foreground: "#101010",
      accent: "#ff1744",
      secondary: "#2979ff",
      muted: "#ffffff",
      border: "#101010",
      panel: "#fffef4",
    },
    fontFamily: 'Impact, Arial, "PingFang SC", sans-serif',
    padding: 86,
    baseFontSize: 42,
    lineHeight: 1.42,
    blockGap: 34,
    radius: 4,
    borderWidth: 7,
    syntax: syntax({
      foreground: "#101010",
      accent: "#ff1744",
      secondary: "#2979ff",
      muted: "#ffffff",
      border: "#101010",
      panel: "#fffef4",
    }, 4),
    motif: "dots",
  };
