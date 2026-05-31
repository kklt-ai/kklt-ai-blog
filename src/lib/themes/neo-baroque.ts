import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const neoBaroqueTheme: ThemeDefinition = {
    id: "neo-baroque",
    name: "新巴洛克",
    description: "深红金色、戏剧明暗和华丽层次，适合奢华感内容。",
    colors: {
      background: "#1b0910",
      foreground: "#fff1cf",
      accent: "#d4af37",
      secondary: "#7d1624",
      muted: "#2a1018",
      border: "#c8982b",
      panel: "#260d16",
    },
    fontFamily: '"Bodoni 72", Didot, Georgia, "Songti SC", serif',
    padding: 88,
    baseFontSize: 41,
    lineHeight: 1.55,
    blockGap: 32,
    radius: 16,
    borderWidth: 4,
    syntax: syntax({
      foreground: "#fff1cf",
      accent: "#d4af37",
      secondary: "#7d1624",
      muted: "#2a1018",
      border: "#c8982b",
      panel: "#260d16",
    }, 18),
    motif: "burst",
  };
