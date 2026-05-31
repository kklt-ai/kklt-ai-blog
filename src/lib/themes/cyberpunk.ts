import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const cyberpunkTheme: ThemeDefinition = {
    id: "cyberpunk",
    name: "赛博朋克",
    description: "霓虹粉蓝、暗夜都市和故障感层级，适合趋势与观点。",
    colors: {
      background: "#080812",
      foreground: "#f4f7ff",
      accent: "#ff2bd6",
      secondary: "#00e5ff",
      muted: "#1b1230",
      border: "#5cffd6",
      panel: "#100d1f",
    },
    fontFamily: '"Space Mono", Menlo, Consolas, "PingFang SC", monospace',
    padding: 78,
    baseFontSize: 40,
    lineHeight: 1.48,
    blockGap: 32,
    radius: 4,
    borderWidth: 4,
    syntax: syntax({
      foreground: "#f4f7ff",
      accent: "#ff2bd6",
      secondary: "#00e5ff",
      muted: "#1b1230",
      border: "#5cffd6",
      panel: "#100d1f",
    }, 4),
    motif: "grid",
  };
