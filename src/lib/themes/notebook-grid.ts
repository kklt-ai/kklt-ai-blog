import type { ThemeDefinition } from "../types";
import { syntax } from "./shared";

export const notebookGridTheme: ThemeDefinition = {
    id: "notebook-grid",
    name: "方格笔记本",
    description: "浅蓝方格纸、顶部彩色标签和橙色重点，适合教程与口语化笔记。",
    colors: {
      background: "#fbfbfa",
      foreground: "#555555",
      accent: "#ff3d00",
      secondary: "#d8f3ff",
      muted: "#f2f8fb",
      border: "#cfeefa",
      panel: "#ffffff",
    },
    fontFamily: 'Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
    padding: 90,
    baseFontSize: 42,
    lineHeight: 1.58,
    blockGap: 36,
    radius: 0,
    borderWidth: 0,
    syntax: {
      ...syntax({
        foreground: "#555555",
        accent: "#ff3d00",
        secondary: "#d8f3ff",
        muted: "#f2f8fb",
        border: "#cfeefa",
        panel: "#ffffff",
      }, 20),
      headingColor: "#ff3d00",
      headingBackground: "transparent",
      strongColor: "#ff3d00",
      imageBorderColor: "#ffa8bd",
    },
    motif: "notebook-grid",
  };
