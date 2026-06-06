import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const futuristicTechTheme: ThemeDefinition = {
    id: "futuristic-tech",
    name: "未来科技",
    description: "深色界面、霓虹蓝紫和数据感网格，适合科技分析。",
    colors: {
      background: "#07101f",
      foreground: "#e8f7ff",
      accent: "#00d9ff",
      secondary: "#6c4dff",
      muted: "#11243a",
      border: "#39f0ff",
      panel: "#0b1728",
    },
    fontFamily: '"Space Mono", Menlo, Consolas, "PingFang SC", monospace',
    padding: 82,
    baseFontSize: 39,
    lineHeight: 1.52,
    blockGap: 30,
    radius: 14,
    borderWidth: 2,
    syntax: syntax({
      foreground: "#e8f7ff",
      accent: "#00d9ff",
      secondary: "#6c4dff",
      muted: "#11243a",
      border: "#39f0ff",
      panel: "#0b1728",
    }, 14),
    motif: "grid",
  };
