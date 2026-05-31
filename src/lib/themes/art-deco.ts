import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const artDecoTheme: ThemeDefinition = {
    id: "art-deco",
    name: "艺术装饰",
    description: "黑金配色、几何边框和爵士时代气质，适合金句卡片。",
    colors: {
      background: "#0e0b12",
      foreground: "#fff6dc",
      accent: "#d4af37",
      secondary: "#24314f",
      muted: "#1a1520",
      border: "#d4af37",
      panel: "#17111d",
    },
    fontFamily: '"Copperplate", "Bodoni 72", Georgia, "Songti SC", serif',
    padding: 90,
    baseFontSize: 41,
    lineHeight: 1.5,
    blockGap: 32,
    radius: 0,
    borderWidth: 5,
    syntax: syntax({
      foreground: "#fff6dc",
      accent: "#d4af37",
      secondary: "#24314f",
      muted: "#1a1520",
      border: "#d4af37",
      panel: "#17111d",
    }, 0),
    motif: "burst",
  };
