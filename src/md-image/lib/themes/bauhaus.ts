import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const bauhausTheme: ThemeDefinition = {
    id: "bauhaus",
    name: "包豪斯",
    description: "红黄蓝基础几何与理性网格，适合框架、模型和方法论。",
    colors: {
      background: "#f4f0e6",
      foreground: "#111111",
      accent: "#e53935",
      secondary: "#f7c948",
      muted: "#f9f6ee",
      border: "#111111",
      panel: "#ffffff",
    },
    fontFamily: 'Futura, Helvetica, Arial, "PingFang SC", sans-serif',
    padding: 84,
    baseFontSize: 40,
    lineHeight: 1.48,
    blockGap: 30,
    radius: 0,
    borderWidth: 4,
    syntax: syntax({
      foreground: "#111111",
      accent: "#e53935",
      secondary: "#f7c948",
      muted: "#f9f6ee",
      border: "#111111",
      panel: "#ffffff",
    }, 0),
    motif: "memphis",
  };
