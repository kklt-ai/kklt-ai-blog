"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MimoCodeHome.module.css";

const ASSET_BASE = "/mimo-code/assets";
const INSTALL_COMMAND = "curl -fsSL https://mimo.xiaomi.com/install | bash";

type Language = "zh" | "en";

const copy = {
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

const cardLayoutClasses = [
  styles.cardOne,
  styles.cardTwo,
  styles.cardThree,
  styles.cardFour,
  styles.cardFive,
];

function ArrowIcon() {
  return (
    <svg className={styles.btnArrow} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.3333 3.66665H12.3333V9.66665"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.848 12.152L12.3333 3.66665"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CaretIcon() {
  return (
    <svg className={styles.navCaret} width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true">
      <path fill="currentColor" d="M16 22 6 12l1.4-1.4 8.6 8.6 8.6-8.6L26 12z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className={`${styles.copyIcon} ${styles.checkIcon}`} viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M4 9.5 L7.5 13 L14 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function MimoCodeHome() {
  const heroRef = useRef<HTMLElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const [language, setLanguage] = useState<Language>("zh");
  const [copied, setCopied] = useState(false);
  const [visibleSubtitleChars, setVisibleSubtitleChars] = useState(0);
  const [typedCards, setTypedCards] = useState<Set<string>>(() => new Set());
  const text = copy[language];

  const subtitleChars = useMemo(() => Array.from(text.subtitle), [text.subtitle]);
  const subtitleDone = visibleSubtitleChars >= subtitleChars.length;

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => {
    setVisibleSubtitleChars(0);
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(max-width: 700px)").matches
    ) {
      setVisibleSubtitleChars(subtitleChars.length);
      return;
    }

    const timers = subtitleChars.map((_, index) =>
      window.setTimeout(() => {
        setVisibleSubtitleChars((count) => Math.max(count, index + 1));
      }, 350 + index * 55),
    );
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [language, subtitleChars]);

  useEffect(() => {
    if (!heroRef.current || !maskRef.current || typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const heroNode = heroRef.current as HTMLElement;
    const canvasNode = maskRef.current as HTMLCanvasElement;
    const maybeContext = canvasNode.getContext("2d");
    if (!maybeContext) return;
    const ctx = maybeContext as CanvasRenderingContext2D;

    const mask = "252, 250, 248";
    const rStart = 8;
    const rEnd = 128;
    const rVary = 0.45;
    const lifetime = 520;
    const stampStep = 12;
    const maxStamps = 160;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const stamps: Array<{ x: number; y: number; born: number; seed: number; rmax: number }> = [];

    let width = 0;
    let height = 0;
    let lastX: number | null = null;
    let lastY: number | null = null;
    let running = false;

    function resize() {
      const rect = heroNode.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvasNode.width = Math.round(width * dpr);
      canvasNode.height = Math.round(height * dpr);
      canvasNode.style.width = `${width}px`;
      canvasNode.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgb(${mask})`;
      ctx.fillRect(0, 0, width, height);
    }

    function addStamp(x: number, y: number) {
      if (stamps.length >= maxStamps) stamps.shift();
      stamps.push({
        x,
        y,
        born: performance.now(),
        seed: Math.random() * Math.PI * 2,
        rmax: rEnd * (1 - rVary + Math.random() * rVary),
      });
    }

    function stampAlong(x: number, y: number) {
      if (lastX === null || lastY === null) {
        addStamp(x, y);
      } else {
        const dx = x - lastX;
        const dy = y - lastY;
        const dist = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(dist / stampStep));
        for (let i = 1; i <= steps; i += 1) {
          addStamp(lastX + (dx * i) / steps, lastY + (dy * i) / steps);
        }
      }
      lastX = x;
      lastY = y;
    }

    function carveInk(x: number, y: number, radius: number, alpha: number, seed: number) {
      const gradient = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${0.95 * alpha})`);
      gradient.addColorStop(0.55, `rgba(0, 0, 0, ${0.88 * alpha})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();

      for (let i = 0; i <= 32; i += 1) {
        const angle = (i / 32) * Math.PI * 2;
        const wobble =
          0.78 +
          0.14 * Math.sin(angle * 3 + seed) +
          0.08 * Math.sin(angle * 7 + seed * 2.1) +
          0.05 * Math.sin(angle * 13 + seed * 0.7);
        const rr = radius * wobble;
        const px = x + Math.cos(angle) * rr;
        const py = y + Math.sin(angle) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.closePath();
      ctx.fill();
    }

    function loop() {
      const now = performance.now();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgb(${mask})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "destination-out";

      for (let i = stamps.length - 1; i >= 0; i -= 1) {
        const age = (now - stamps[i].born) / lifetime;
        if (age >= 1) {
          stamps.splice(i, 1);
          continue;
        }
        const ease = 1 - (1 - age) ** 3;
        const radius = rStart + (stamps[i].rmax - rStart) * ease;
        carveInk(stamps[i].x, stamps[i].y, radius, 1 - age * age, stamps[i].seed);
      }

      if (stamps.length) {
        window.requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }

    function start() {
      if (!running) {
        running = true;
        window.requestAnimationFrame(loop);
      }
    }

    function handlePointerMove(event: MouseEvent) {
      const rect = heroNode.getBoundingClientRect();
      stampAlong(event.clientX - rect.left, event.clientY - rect.top);
      start();
    }

    function handlePointerEnter(event: MouseEvent) {
      const rect = heroNode.getBoundingClientRect();
      lastX = event.clientX - rect.left;
      lastY = event.clientY - rect.top;
      stampAlong(lastX, lastY);
      start();
    }

    function handlePointerLeave() {
      lastX = null;
      lastY = null;
    }

    resize();
    window.addEventListener("resize", resize);
    heroNode.addEventListener("mouseenter", handlePointerEnter);
    heroNode.addEventListener("mousemove", handlePointerMove);
    heroNode.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("resize", resize);
      heroNode.removeEventListener("mouseenter", handlePointerEnter);
      heroNode.removeEventListener("mousemove", handlePointerMove);
      heroNode.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setTypedCards(new Set(text.cards.map((card) => card.id)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).dataset.cardId;
          if (!id) return;
          setTypedCards((current) => new Set(current).add(id));
        });
      },
      { threshold: 0.25 },
    );

    const titles = document.querySelectorAll<HTMLElement>("[data-card-id]");
    titles.forEach((title) => observer.observe(title));
    return () => observer.disconnect();
  }, [text.cards]);

  async function copyCommand() {
    let ok = false;
    try {
      await navigator.clipboard?.writeText(INSTALL_COMMAND);
      ok = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = INSTALL_COMMAND;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-1000px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      ok = document.execCommand("copy");
      textarea.remove();
    }

    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className={styles.page}>
      <section ref={heroRef} className={styles.hero} id="hero">
        <div className={styles.heroBg} aria-hidden="true" />
        <canvas ref={maskRef} className={styles.heroMask} aria-hidden="true" />

        <a className={styles.logoLink} href="/zh/" aria-label="MiMo">
          <img className={styles.logo} src={`${ASSET_BASE}/logo.png`} alt="Xiaomi MiMo" width="120" />
        </a>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.heroBar}>
          <nav className={styles.nav} aria-label="Main navigation">
            <div className={styles.navDropdown}>
              <button type="button" className={`${styles.navLink} ${styles.navDropdownTrigger}`}>
                <span>{text.product}</span>
                <CaretIcon />
              </button>
              <div className={styles.navMenu} role="menu">
                <a className={styles.navMenuItem} href="/zh/mimocode" role="menuitem">
                  MiMo Code
                </a>
              </div>
            </div>
            <a className={styles.navLink} href="/zh/#blog">
              {text.blog}
            </a>
            <a className={styles.navLink} href="/zh/#joinUs">
              {text.joinUs}
            </a>
          </nav>

          <div className={`${styles.lang} ${styles.navDropdown}`}>
            <button type="button" className={`${styles.langTrigger} ${styles.navDropdownTrigger}`} aria-label="Language">
              <img className={styles.langIcon} src={`${ASSET_BASE}/icon-translate.svg`} alt="" />
              <CaretIcon />
            </button>
            <div className={`${styles.navMenu} ${styles.langMenu}`} role="menu">
              <button
                type="button"
                className={`${styles.navMenuItem} ${styles.langOption} ${language === "zh" ? styles.active : ""}`}
                onClick={() => setLanguage("zh")}
                role="menuitem"
              >
                简体中文
              </button>
              <button
                type="button"
                className={`${styles.navMenuItem} ${styles.langOption} ${language === "en" ? styles.active : ""}`}
                onClick={() => setLanguage("en")}
                role="menuitem"
              >
                English
              </button>
            </div>
          </div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroHeading}>
            <h1 className={styles.heroTitle}>MiMo Code</h1>
            <p
              className={`${styles.subtitle} ${subtitleDone ? styles.subtitleDone : ""}`}
              aria-label={text.subtitle}
              key={text.subtitle}
            >
              {subtitleChars.map((char, index) => (
                <span
                  className={`${styles.subtitleChar} ${index < visibleSubtitleChars ? styles.visibleChar : ""}`}
                  key={`${char}-${index}`}
                >
                  {char}
                </span>
              ))}
              <span className={styles.typeCaret} aria-hidden="true" />
            </p>
          </div>

          <div className={styles.terminal} role="presentation">
            <span className={styles.command}>
              <span className={styles.prompt}>&gt;_</span>
              {INSTALL_COMMAND}
            </span>
            <button
              className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
              type="button"
              aria-label="复制命令"
              onClick={copyCommand}
            >
              <img className={`${styles.copyIcon} ${styles.copyGlyph}`} src={`${ASSET_BASE}/icon-copy.svg`} alt="" />
              <CheckIcon />
              <span className={styles.copyTooltip} aria-hidden="true">
                {text.copied}
              </span>
            </button>
          </div>

          <div className={styles.ctas}>
            <a className={styles.btn} href="https://github.com/XiaomiMiMo/MiMo-Code" target="_blank" rel="noreferrer">
              GitHub
              <ArrowIcon />
            </a>
            <a className={styles.btn} href="/zh/mimocode/start">
              {text.docs}
              <ArrowIcon />
            </a>
            <a className={`${styles.btn} ${styles.primaryBtn}`} href="/zh/blog/mimo-code-long-horizon">
              Blog
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>{text.featuresTitle}</h2>
        <div className={styles.featuresList}>
          {text.cards.map((card, index) => {
            const typed = typedCards.has(card.id);
            return (
              <article className={`${styles.card} ${cardLayoutClasses[index]}`} key={card.id}>
                <div className={styles.cardPainting}>
                  <img src={`${ASSET_BASE}/${card.image}`} alt="" />
                </div>
                <div className={styles.cardText}>
                  <h3
                    className={`${styles.cardTitle} ${typed ? styles.cardTyped : ""}`}
                    data-card-id={card.id}
                    aria-label={card.title}
                  >
                    {Array.from(card.title).map((char, charIndex) => (
                      <span
                        className={styles.cardChar}
                        style={{ animationDelay: `${charIndex * 130}ms` }}
                        key={`${char}-${charIndex}`}
                      >
                        {char}
                      </span>
                    ))}
                    <span className={styles.cursor} aria-hidden="true" />
                  </h3>
                  <p>{card.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Copyright©2025 Xiaomi. All Rights Reserved</span>
          <span className={styles.footerSep}>|</span>
          <a className={styles.footerLink} href="#service-agreement">
            Xiaomi MiMo Open Platform Service Agreement
          </a>
          <span className={styles.footerSep}>|</span>
          <a className={styles.footerLink} href="#privacy-policy">
            Xiaomi MiMo Open Platform Privacy Policy
          </a>
          <span className={styles.footerSep}>|</span>
          <a className={styles.footerLink} href="#cookie-policy">
            Cookie Policy
          </a>
          <span className={styles.footerSep}>|</span>
          <button className={styles.footerBtn} type="button">
            Cookie Preferences
          </button>
        </div>
      </footer>
    </main>
  );
}
