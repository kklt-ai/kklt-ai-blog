import type { CoverTemplate } from "../types";
import { templateIconLayer, templateTextLayer } from "./helpers";

export const XIAOHONGSHU_COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: "xhs-dog-and-cat-qa",
    name: "猫狗问答卡",
    channel: "xiaohongshu",
    description: "可爱网格纸背景，适合问答、作者介绍和轻松观点。",
    backgroundClassName: "bg-[#fff7d7]",
    backgroundImageId: "xhs-dog-and-cat",
    layers: [
      templateTextLayer("xhs-dog-and-cat-qa-title", "这个网站的作者是谁？", {
        x: 10,
        y: 20,
        width: 80,
        fontSize: 92,
        color: "#1f1308",
        fontFamily: "rounded",
        bold: true,
        textEffect: "shadow-yellow",
      }),
      templateTextLayer("xhs-dog-and-cat-qa-subtitle", "卡卡罗特AI", {
        x: 20,
        y: 33,
        width: 60,
        fontSize: 74,
        color: "#1b1b1b",
        fontFamily: "rounded",
        bold: true,
        highlightEffect: "highlight-bottom-green",
      }),
    ],
  },
];
