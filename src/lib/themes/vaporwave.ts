import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const vaporwaveTheme: ThemeDefinition = {
    id: "vaporwave",
    name: "蒸汽波",
    description: "粉紫青蓝、复古互联网和梦幻网格，适合怀旧灵感。",
    colors: {
      background: "#ffe1f5",
      foreground: "#241447",
      accent: "#ff5fc8",
      secondary: "#39d9e8",
      muted: "#f8edff",
      border: "#6b49c8",
      panel: "#fff8ff",
    },
    fontFamily: '"Times New Roman", Georgia, "Songti SC", serif',
    padding: 86,
    baseFontSize: 41,
    lineHeight: 1.54,
    blockGap: 32,
    radius: 18,
    borderWidth: 3,
    syntax: syntax({
      foreground: "#241447",
      accent: "#ff5fc8",
      secondary: "#39d9e8",
      muted: "#f8edff",
      border: "#6b49c8",
      panel: "#fff8ff",
    }, 18),
    motif: "grid",
  };
