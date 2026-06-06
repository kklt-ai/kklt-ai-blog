import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const victorianTheme: ThemeDefinition = {
    id: "victorian",
    name: "维多利亚",
    description: "繁复边框、古典衬线和旧书页色调，适合长文摘录。",
    colors: {
      background: "#ead8b8",
      foreground: "#321f14",
      accent: "#8b1e1e",
      secondary: "#c7a46a",
      muted: "#f1e2c5",
      border: "#5a3821",
      panel: "#fff0cf",
    },
    fontFamily: 'Georgia, "Times New Roman", "Songti SC", serif',
    padding: 94,
    baseFontSize: 40,
    lineHeight: 1.64,
    blockGap: 30,
    radius: 2,
    borderWidth: 6,
    syntax: syntax({
      foreground: "#321f14",
      accent: "#8b1e1e",
      secondary: "#c7a46a",
      muted: "#f1e2c5",
      border: "#5a3821",
      panel: "#fff0cf",
    }, 10),
    motif: "dots",
  };
