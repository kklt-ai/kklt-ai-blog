export type Language = "zh" | "en";

export const ASSET_BASE = "/home/assets";
export const INSTALL_COMMAND = "curl -fsSL https://mimo.xiaomi.com/install | bash";

export const homeCopy = {
  zh: {
    product: "产品",
    blog: "博客",
    joinUs: "加入我们",
    docs: "文档",
    subtitle:
      "面向开发者的新一代 AI 编程助手，支持无限上下文，帮助你更高效地理解、构建与协作。",
    featuresTitle: "为什么选择 MiMo Code",
    copied: "已复制",
    cards: [
      {
        id: "model",
        title: "开箱即用顶尖模型",
        body: "无需登录，开箱即用，免费体验比肩 Claude Sonnet 4.6 级别多模态模型。",
        image: "feature-model.png",
      },
      {
        id: "agent",
        title: "模型 Agent 协同",
        body: "MiMo 模型与 Agent 协同优化，复杂编码任务一次搞定。",
        image: "feature-agent.png",
      },
      {
        id: "context",
        title: "无限上下文",
        body: "知识自动沉淀，配合记忆整理。上百轮对话，也不丢失关键信息，智商始终在线。",
        image: "feature-context.png",
      },
      {
        id: "evolution",
        title: "自进化系统",
        body: "基于使用反馈持续学习与优化，模型能力、工具链、工作流随你的项目共同成长。越用越懂你，越用越顺手，打造专属智能开发伙伴。",
        image: "feature-evolution.png",
      },
      {
        id: "compose",
        title: "Compose模式",
        body: "一个人的专业开发团队，从想法到产品的工业级交付",
        image: "feature-compose.png",
      },
    ],
  },
  en: {
    product: "Product",
    blog: "Blog",
    joinUs: "Join Us",
    docs: "Docs",
    subtitle:
      "A next-generation AI coding assistant for developers. Unlimited context lets you understand, build, and collaborate more efficiently.",
    featuresTitle: "Why Choose MiMo Code",
    copied: "Copied",
    cards: [
      {
        id: "model",
        title: "Top-Tier Models Out of the Box",
        body: "No login, ready out of the box. Experience multimodal models on par with Claude Sonnet 4.6, free.",
        image: "feature-model.png",
      },
      {
        id: "agent",
        title: "Model-Agent Collaboration",
        body: "MiMo models and agents are optimized together to complete complex coding tasks in one pass.",
        image: "feature-agent.png",
      },
      {
        id: "context",
        title: "Unlimited Context",
        body: "Knowledge accumulates automatically with memory organization, preserving critical details across long conversations.",
        image: "feature-context.png",
      },
      {
        id: "evolution",
        title: "Self-Evolving System",
        body: "Learns continuously from your feedback. Models, toolchain, and workflows grow with your project.",
        image: "feature-evolution.png",
      },
      {
        id: "compose",
        title: "Compose Mode",
        body: "A professional dev team in a single person, with industrial-grade delivery from idea to product.",
        image: "feature-compose.png",
      },
    ],
  },
} as const;

export type HomeCopy = (typeof homeCopy)[Language];
export type FeatureCardCopy = HomeCopy["cards"][number];
