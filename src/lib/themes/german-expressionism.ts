import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const germanExpressionismTheme: ThemeDefinition = {
    id: "german-expressionism",
    name: "德国表现主义",
    description: "暗色剧场、尖锐对比和木刻感，适合情绪化叙事。",
    colors: {
      background: "#151012",
      foreground: "#f5e6c8",
      accent: "#c51f2b",
      secondary: "#d7a632",
      muted: "#261b1d",
      border: "#f5e6c8",
      panel: "#1f1719",
    },
    fontFamily: '"Arial Narrow", Impact, "PingFang SC", sans-serif',
    padding: 82,
    baseFontSize: 41,
    lineHeight: 1.46,
    blockGap: 34,
    radius: 0,
    borderWidth: 5,
    syntax: syntax({
      foreground: "#f5e6c8",
      accent: "#c51f2b",
      secondary: "#d7a632",
      muted: "#261b1d",
      border: "#f5e6c8",
      panel: "#1f1719",
    }, 0),
    motif: "grid",
  };
