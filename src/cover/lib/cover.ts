export type CoverChannelId = "xiaohongshu" | "wechat";

export type CoverChannel = {
  id: CoverChannelId;
  name: string;
  sizeLabel: string;
  brandColor: string;
  brandForeground: string;
  width: number;
  height: number;
};

export type BrandIconId =
  | "alibaba"
  | "codex"
  | "openai"
  | "anthropic"
  | "antigravity"
  | "apple"
  | "baidu"
  | "capcut"
  | "claudecode"
  | "cline"
  | "cursor"
  | "deepseek"
  | "dify"
  | "figma"
  | "github"
  | "google"
  | "grok"
  | "huawei"
  | "jimeng"
  | "kiro"
  | "moonshot"
  | "nanobanana"
  | "notion"
  | "qoder";

export type TextAlign = "left" | "center" | "right";
export type CoverFontFamily = "system" | "serif" | "rounded" | "mono";
export type CoverTextEffect = "none" | "outline" | "shadow" | "glow" | "gradient" | "poster";

export type CoverTextLayer = {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  color: string;
  fontFamily: CoverFontFamily;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: TextAlign;
  letterSpacing?: number;
  textEffect?: CoverTextEffect;
};

export type CoverIconLayer = {
  id: string;
  type: "icon";
  iconId: BrandIconId;
  x: number;
  y: number;
  size: number;
};

export type CoverLayer = CoverTextLayer | CoverIconLayer;

export type CoverTemplate = {
  id: string;
  name: string;
  channel: CoverChannelId;
  description: string;
  backgroundClassName: string;
  layers: CoverLayer[];
};

export type CoverBackgroundImage = {
  id: string;
  name: string;
  channel: CoverChannelId;
  src: string;
};

export type BrandIcon = {
  id: BrandIconId;
  name: string;
  mark: string;
  className: string;
  src?: string;
};

let nextLayerId = 1;

function layerId(prefix: string) {
  nextLayerId += 1;
  return `${prefix}-${Date.now().toString(36)}-${nextLayerId}`;
}

export const COVER_CHANNELS: CoverChannel[] = [
  {
    id: "xiaohongshu",
    name: "小红书",
    sizeLabel: "3:4 竖版",
    brandColor: "#ff2442",
    brandForeground: "#ffffff",
    width: 1242,
    height: 1660,
  },
  {
    id: "wechat",
    name: "公众号",
    sizeLabel: "首图横版",
    brandColor: "#07c160",
    brandForeground: "#ffffff",
    width: 1200,
    height: 628,
  },
];

export const BRAND_ICONS: BrandIcon[] = [
  {
    id: "codex",
    name: "Codex",
    mark: "Cx",
    className: "bg-white text-zinc-950",
    src: "/logo/codex.svg",
  },
  {
    id: "openai",
    name: "OpenAI",
    mark: "OA",
    className: "bg-white text-zinc-950",
    src: "/logo/openai.svg",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    mark: "A",
    className: "bg-white text-zinc-950",
    src: "/logo/anthropic.svg",
  },
  {
    id: "alibaba",
    name: "Alibaba",
    mark: "A",
    className: "bg-white text-zinc-950",
    src: "/logo/alibaba.svg",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    mark: "Ag",
    className: "bg-white text-zinc-950",
    src: "/logo/antigravity.svg",
  },
  {
    id: "apple",
    name: "Apple",
    mark: "Ap",
    className: "bg-white text-zinc-950",
    src: "/logo/apple.svg",
  },
  {
    id: "baidu",
    name: "Baidu",
    mark: "Bd",
    className: "bg-white text-zinc-950",
    src: "/logo/baidu.svg",
  },
  {
    id: "capcut",
    name: "CapCut",
    mark: "Cc",
    className: "bg-white text-zinc-950",
    src: "/logo/capcut.svg",
  },
  {
    id: "claudecode",
    name: "Claude Code",
    mark: "CC",
    className: "bg-white text-zinc-950",
    src: "/logo/claudecode.svg",
  },
  {
    id: "cline",
    name: "Cline",
    mark: "Cl",
    className: "bg-white text-zinc-950",
    src: "/logo/cline.svg",
  },
  {
    id: "cursor",
    name: "Cursor",
    mark: "Cu",
    className: "bg-white text-zinc-950",
    src: "/logo/cursor.svg",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    mark: "Ds",
    className: "bg-white text-zinc-950",
    src: "/logo/deepseek.svg",
  },
  {
    id: "dify",
    name: "Dify",
    mark: "Df",
    className: "bg-white text-zinc-950",
    src: "/logo/dify.svg",
  },
  {
    id: "figma",
    name: "Figma",
    mark: "Fg",
    className: "bg-white text-zinc-950",
    src: "/logo/figma.svg",
  },
  {
    id: "github",
    name: "GitHub",
    mark: "Gh",
    className: "bg-white text-zinc-950",
    src: "/logo/github.svg",
  },
  {
    id: "google",
    name: "Google",
    mark: "Go",
    className: "bg-white text-zinc-950",
    src: "/logo/google.svg",
  },
  {
    id: "grok",
    name: "Grok",
    mark: "Gk",
    className: "bg-white text-zinc-950",
    src: "/logo/grok.svg",
  },
  {
    id: "huawei",
    name: "Huawei",
    mark: "Hw",
    className: "bg-white text-zinc-950",
    src: "/logo/huawei.svg",
  },
  {
    id: "jimeng",
    name: "Jimeng",
    mark: "Jm",
    className: "bg-white text-zinc-950",
    src: "/logo/jimeng.svg",
  },
  {
    id: "kiro",
    name: "Kiro",
    mark: "Ki",
    className: "bg-white text-zinc-950",
    src: "/logo/kiro.svg",
  },
  {
    id: "moonshot",
    name: "Moonshot",
    mark: "Ms",
    className: "bg-white text-zinc-950",
    src: "/logo/moonshot.svg",
  },
  {
    id: "nanobanana",
    name: "Nano Banana",
    mark: "NB",
    className: "bg-white text-zinc-950",
    src: "/logo/nanobanana.svg",
  },
  {
    id: "notion",
    name: "Notion",
    mark: "No",
    className: "bg-white text-zinc-950",
    src: "/logo/notion.svg",
  },
  {
    id: "qoder",
    name: "Qoder",
    mark: "Qd",
    className: "bg-white text-zinc-950",
    src: "/logo/qoder.svg",
  },
];

export const COVER_FONT_FAMILIES: Array<{
  id: CoverFontFamily;
  name: string;
  css: string;
}> = [
  {
    id: "system",
    name: "现代黑体",
    css: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  {
    id: "serif",
    name: "杂志宋体",
    css: "Georgia, 'Songti SC', 'SimSun', serif",
  },
  {
    id: "rounded",
    name: "圆润标题",
    css: "'Arial Rounded MT Bold', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  {
    id: "mono",
    name: "科技等宽",
    css: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
  },
];

export const COVER_BACKGROUND_IMAGES: CoverBackgroundImage[] = [
  {
    id: "window-card",
    name: "窗口卡片",
    channel: "xiaohongshu",
    src: "/cover/template/xiaohongshu/1.jpeg",
  },
  {
    id: "binder-grid",
    name: "活页方格",
    channel: "xiaohongshu",
    src: "/cover/template/xiaohongshu/2.jpeg",
  },
  {
    id: "plaster-texture",
    name: "石膏纹理",
    channel: "xiaohongshu",
    src: "/cover/template/xiaohongshu/3.jpeg",
  },
  {
    id: "wechat-wide-1",
    name: "公众号横版 1",
    channel: "wechat",
    src: "/cover/template/wechat/1040g0k031k37k0f5k81g5o9g8p1gj1ofh8vag48.jpeg",
  },
  {
    id: "wechat-wide-2",
    name: "公众号横版 2",
    channel: "wechat",
    src: "/cover/template/wechat/1040g0k031k37k0f5k83g5o9g8p1gj1ofailuu80.jpeg",
  },
  {
    id: "wechat-wide-3",
    name: "公众号横版 3",
    channel: "wechat",
    src: "/cover/template/wechat/1040g0k031k37k0f5k8405o9g8p1gj1ofno0kkko.jpeg",
  },
  {
    id: "wechat-cover-1",
    name: "公众号竖版",
    channel: "wechat",
    src: "/cover/template/wechat/1040g34o31k37lf3pj60g5o9g8p1gj1ofmbm41oo.jpeg",
  },
];

export function fontFamilyCss(fontFamily: CoverFontFamily) {
  return (
    COVER_FONT_FAMILIES.find((font) => font.id === fontFamily)?.css ??
    COVER_FONT_FAMILIES[0].css
  );
}

export function createTextLayer(text = "双击改标题"): CoverTextLayer {
  return {
    id: layerId("text"),
    type: "text",
    text,
    x: 18,
    y: 36,
    width: 64,
    fontSize: 72,
    color: "#111111",
    fontFamily: "system",
    bold: true,
    italic: false,
    underline: false,
    align: "center",
    textEffect: "none",
  };
}

export function createIconLayer(iconId: BrandIconId): CoverIconLayer {
  return {
    id: layerId("icon"),
    type: "icon",
    iconId,
    x: 72,
    y: 12,
    size: 13,
  };
}

function templateTextLayer(
  id: string,
  text: string,
  overrides: Partial<CoverTextLayer>,
): CoverTextLayer {
  return {
    ...createTextLayer(text),
    id,
    ...overrides,
  };
}

function templateIconLayer(
  id: string,
  iconId: BrandIconId,
  overrides: Partial<CoverIconLayer>,
): CoverIconLayer {
  return {
    ...createIconLayer(iconId),
    id,
    ...overrides,
  };
}

export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: "xhs-ai-hot",
    name: "AI 爆款封面",
    channel: "xiaohongshu",
    description: "醒目标题、强对比贴纸风，适合教程/观点。",
    backgroundClassName:
      "bg-[radial-gradient(circle_at_18%_18%,#ffffff_0_10%,transparent_11%),linear-gradient(135deg,#fff15f_0%,#ff4fb3_48%,#34d5ff_100%)]",
    layers: [
      templateTextLayer("xhs-ai-hot-title", "AI 工具\n效率翻倍", {
        x: 12,
        y: 28,
        width: 76,
        fontSize: 108,
        color: "#111111",
        bold: true,
      }),
      templateTextLayer("xhs-ai-hot-subtitle", "Codex × OpenAI 实战封面", {
        x: 16,
        y: 66,
        width: 68,
        fontSize: 42,
        color: "#ffffff",
      }),
      templateIconLayer("xhs-ai-hot-icon", "codex", { x: 72, y: 10, size: 15 }),
    ],
  },
  {
    id: "xhs-soft-lab",
    name: "柔光知识卡",
    channel: "xiaohongshu",
    description: "干净柔和，适合清单、读书和复盘内容。",
    backgroundClassName:
      "bg-[linear-gradient(160deg,#fff7ed_0%,#fef3c7_44%,#dbeafe_100%)]",
    layers: [
      templateTextLayer("xhs-soft-lab-title", "新手也能懂的\nAI 工作流", {
        x: 13,
        y: 22,
        width: 74,
        fontSize: 86,
        color: "#7c2d12",
        fontFamily: "serif",
      }),
      templateTextLayer("xhs-soft-lab-subtitle", "收藏这一篇就够了", {
        x: 23,
        y: 62,
        width: 54,
        fontSize: 42,
        color: "#1e3a8a",
      }),
      templateIconLayer("xhs-soft-lab-icon", "openai", { x: 11, y: 11, size: 12 }),
    ],
  },
  {
    id: "xhs-black-gold",
    name: "黑金发布会",
    channel: "xiaohongshu",
    description: "高级发布会风格，适合新品、课程和重磅观点。",
    backgroundClassName:
      "bg-[radial-gradient(circle_at_76%_18%,#fde68a_0_8%,transparent_9%),linear-gradient(145deg,#111827_0%,#312e81_54%,#f59e0b_100%)]",
    layers: [
      templateTextLayer("xhs-black-gold-title", "年度 AI\n工具清单", {
        x: 10,
        y: 27,
        width: 78,
        fontSize: 96,
        color: "#fef3c7",
        fontFamily: "serif",
      }),
      templateTextLayer("xhs-black-gold-subtitle", "从灵感到交付，一页讲透", {
        x: 18,
        y: 64,
        width: 64,
        fontSize: 38,
        color: "#ffffff",
      }),
      templateIconLayer("xhs-black-gold-icon", "anthropic", { x: 73, y: 11, size: 13 }),
    ],
  },
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

export function getChannel(channelId: CoverChannelId) {
  return COVER_CHANNELS.find((channel) => channel.id === channelId) ?? COVER_CHANNELS[0];
}

export function getTemplatesByChannel(channelId: CoverChannelId) {
  return COVER_TEMPLATES.filter((template) => template.channel === channelId);
}

export function getBackgroundImagesByChannel(channelId: CoverChannelId) {
  return COVER_BACKGROUND_IMAGES.filter((image) => image.channel === channelId);
}

export function cloneTemplateLayers(template: CoverTemplate): CoverLayer[] {
  return template.layers.map((layer) => ({ ...layer }));
}

export function updateLayer<T extends CoverLayer>(
  layers: CoverLayer[],
  layerIdToUpdate: string,
  patch: Partial<T>,
) {
  return layers.map((layer) =>
    layer.id === layerIdToUpdate ? ({ ...layer, ...patch } as CoverLayer) : layer,
  );
}

export function findBrandIcon(iconId: BrandIconId) {
  return BRAND_ICONS.find((icon) => icon.id === iconId) ?? BRAND_ICONS[0];
}
