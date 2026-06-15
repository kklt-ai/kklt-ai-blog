export type Language = "zh" | "en";

export const ASSET_BASE = "/home/assets";
export const GITHUB_URL = "https://github.com/kklt1024me";
export const QR_CODE_SRC = "/kklt-wechat-qrcode-short.jpg";

export const homeCopy = {
  zh: {
    product: "作品",
    blog: "公众号",
    joinUs: "关于",
    docs: "项目",
    subtitle:
      "持续分享有用的 AI 内容～",
    featuresTitle: "卡卡罗特AI 的 Vibe Coding 作品",
    qrTitle: "扫码关注公众号",
    qrBody: "卡卡罗特AI · 有用的 AI 内容",
    github: "GitHub",
    cards: [
      {
        id: "md-card",
        title: "md生成卡片",
        body: "把 Markdown 内容快速排版成适合小红书发布的多页图片，支持主题、字体、水印、分页和一键导出。",
        image: "project-md-card.png",
        href: "/md-card",
      },
      {
        id: "cover",
        title: "自媒体封面",
        body: "为小红书、公众号等内容平台制作封面图，内置模板、背景、图层编辑、对齐辅助和 PNG 导出。",
        image: "project-cover.png",
        href: "/cover",
      },
    ],
  },
  en: {
    product: "Works",
    blog: "WeChat",
    joinUs: "About",
    docs: "Projects",
    subtitle:
      "kklt AI is a WeChat creator sharing practical AI content. This page collects small tools built with vibe coding.",
    featuresTitle: "Vibe Coding Works by kklt AI",
    qrTitle: "Follow on WeChat",
    qrBody: "kklt AI · useful AI content",
    github: "GitHub",
    cards: [
      {
        id: "md-card",
        title: "Markdown Cards",
        body: "Turn Markdown into polished multi-page images for Xiaohongshu, with themes, typography, watermarking, pagination, and export.",
        image: "project-md-card.png",
        href: "/md-card",
      },
      {
        id: "cover",
        title: "Media Covers",
        body: "Design cover images for Xiaohongshu, WeChat, and other creator platforms with templates, backgrounds, layers, guides, and PNG export.",
        image: "project-cover.png",
        href: "/cover",
      },
    ],
  },
} as const;

export type HomeCopy = (typeof homeCopy)[Language];
export type FeatureCardCopy = HomeCopy["cards"][number];
