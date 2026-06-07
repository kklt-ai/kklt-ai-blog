import type { CoverTemplate } from "../types";
import { templateIconLayer, templateTextLayer } from "./helpers";

export const WECHAT_COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: "wechat-deep-read",
    name: "公众号深度文章",
    channel: "wechat",
    description: "横版首图，适合技术长文和产品观察。",
    backgroundClassName:
      "bg-[linear-gradient(120deg,#0f172a_0%,#1e293b_52%,#38bdf8_100%)]",
    layers: [
      templateTextLayer("wechat-deep-read-title", "大模型时代的\n产品判断", {
        x: 8,
        y: 24,
        width: 56,
        fontSize: 68,
        color: "#ffffff",
        align: "left",
      }),
      templateTextLayer("wechat-deep-read-subtitle", "从 Codex 到 Agent 工作流", {
        x: 9,
        y: 66,
        width: 52,
        fontSize: 28,
        color: "#bae6fd",
        align: "left",
      }),
      templateIconLayer("wechat-deep-read-icon", "anthropic", {
        x: 78,
        y: 31,
        size: 12,
      }),
    ],
  },
  {
    id: "wechat-newsroom",
    name: "科技通讯社",
    channel: "wechat",
    description: "明亮杂志感，适合资讯合集和周报。",
    backgroundClassName:
      "bg-[linear-gradient(90deg,#f8fafc_0%,#fef08a_48%,#fb7185_100%)]",
    layers: [
      templateTextLayer("wechat-newsroom-title", "本周 AI 产品\n值得关注的 7 件事", {
        x: 8,
        y: 18,
        width: 60,
        fontSize: 60,
        color: "#111827",
        align: "left",
      }),
      templateTextLayer("wechat-newsroom-subtitle", "OpenAI / Claude / Gemini", {
        x: 9,
        y: 70,
        width: 50,
        fontSize: 26,
        color: "#881337",
        align: "left",
      }),
      templateIconLayer("wechat-newsroom-icon", "google", {
        x: 78,
        y: 30,
        size: 12,
      }),
    ],
  },
  {
    id: "wechat-clean-opinion",
    name: "极简观点首图",
    channel: "wechat",
    description: "留白充足，适合观点输出、播客和访谈。",
    backgroundClassName:
      "bg-[linear-gradient(90deg,#f4f4f5_0%,#ffffff_54%,#c7d2fe_100%)]",
    layers: [
      templateTextLayer("wechat-clean-opinion-title", "为什么说\nAgent 是新入口", {
        x: 8,
        y: 20,
        width: 52,
        fontSize: 62,
        color: "#18181b",
        align: "left",
        fontFamily: "serif",
      }),
      templateTextLayer("wechat-clean-opinion-subtitle", "产品经理需要重新理解工作流", {
        x: 9,
        y: 70,
        width: 48,
        fontSize: 25,
        color: "#4f46e5",
        align: "left",
      }),
      templateIconLayer("wechat-clean-opinion-icon", "codex", {
        x: 80,
        y: 28,
        size: 11,
      }),
    ],
  },
];
