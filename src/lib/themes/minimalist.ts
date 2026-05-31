import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const minimalistTheme: ThemeDefinition = {
    id: "minimalist",
    name: "极简主义",
    description: "黑白灰、细分隔和大留白，适合理性笔记与清单。",
    colors: {
      background: "#fbfbfa",
      foreground: "#161616",
      accent: "#4a4a4a",
      secondary: "#e8e8e5",
      muted: "#f2f2ef",
      border: "#c8c8c2",
      panel: "#ffffff",
    },
    fontFamily: 'Helvetica, Arial, "PingFang SC", sans-serif',
    padding: 116,
    baseFontSize: 39,
    lineHeight: 1.6,
    blockGap: 30,
    radius: 6,
    borderWidth: 1,
    syntax: syntax({
      foreground: "#161616",
      accent: "#4a4a4a",
      secondary: "#e8e8e5",
      muted: "#f2f2ef",
      border: "#c8c8c2",
      panel: "#ffffff",
    }, 8),
    motif: "none",
  };
