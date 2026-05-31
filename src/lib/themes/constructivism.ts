import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const constructivismTheme: ThemeDefinition = {
    id: "constructivism",
    name: "构成主义",
    description: "红黑斜线、结构张力和宣传海报感，适合强论点总结。",
    colors: {
      background: "#f2eadf",
      foreground: "#151515",
      accent: "#d71920",
      secondary: "#2a2a2a",
      muted: "#e3d6c8",
      border: "#151515",
      panel: "#fff7eb",
    },
    fontFamily: 'Arial Black, Impact, "PingFang SC", sans-serif',
    padding: 80,
    baseFontSize: 41,
    lineHeight: 1.42,
    blockGap: 32,
    radius: 0,
    borderWidth: 5,
    syntax: syntax({
      foreground: "#151515",
      accent: "#d71920",
      secondary: "#2a2a2a",
      muted: "#e3d6c8",
      border: "#151515",
      panel: "#fff7eb",
    }, 0),
    motif: "burst",
  };
