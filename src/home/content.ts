export type Language = "zh" | "en";

export const ASSET_BASE = "/home/assets";
export const GITHUB_URL = "https://github.com/kklt1024me";
export const WECHAT_URL = "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzYyMjkwMjg0Ng==&action=getalbum&album_id=4260253598405459979&subscene=159&subscene=189&scenenote=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzYyMjkwMjg0Ng%3D%3D%26mid%3D2247484911%26idx%3D1%26sn%3D9e7a9a8d209fca87fe9107d545167302%26chksm%3Dffcfaebec8b827a8d655c7c81aae1d9f4b66e341320e7d5742e5b6ea92be9f4a523f10decd35%26cur_album_id%3D4260253598405459979%26scene%3D189%23wechat_redirect&nolastread=1#wechat_redirect";
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
      {
        id: "image-splitter",
        title: "自动切图",
        body: "框选图片中的有效区域，按三宫格、六宫格、九宫格或自定义行列快速切分，并打包下载。",
        image: "project-image-splitter.svg",
        href: "/image-splitter",
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
      {
        id: "image-splitter",
        title: "Image Splitter",
        body: "Select an image region, split it into a preset or custom grid, choose the output format, and download every tile as a ZIP.",
        image: "project-image-splitter.svg",
        href: "/image-splitter",
      },
    ],
  },
} as const;

export type HomeCopy = (typeof homeCopy)[Language];
export type FeatureCardCopy = HomeCopy["cards"][number];
