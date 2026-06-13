"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { FeatureSection } from "./components/FeatureSection";
import { HeroSection } from "./components/HeroSection";
import { HomeFooter } from "./components/HomeFooter";
import { homeCopy, Language } from "./content";
import { useHeroInkMask } from "./hooks/useHeroInkMask";
import { useSubtitleTyping } from "./hooks/useSubtitleTyping";

const pageVars = {
  "--color-bg": "#fcfaf8",
  "--color-ink": "#26251e",
  "--color-ink-soft": "#504f49",
  "--color-border": "#979696",
  "--color-chip-bg": "#f3f0ef",
  "--font-mincho": '"Huiwen Mincho", "Noto Serif SC", "Songti SC", "STSong", Georgia, serif',
  "--font-display": '"Questrial", "Century Gothic", "Avenir Next", "MiSans", sans-serif',
  "--font-misans": '"MiSans", "PingFang SC", -apple-system, "Microsoft YaHei", sans-serif',
} as CSSProperties;

export function HomePage() {
  const [language, setLanguage] = useState<Language>("zh");
  const heroRef = useRef<HTMLElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const copy = homeCopy[language];
  const subtitle = useSubtitleTyping(copy.subtitle);

  useHeroInkMask(heroRef, maskRef);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  return (
    <main
      className="min-h-screen bg-[var(--color-bg)] font-['PingFang_SC',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,'Microsoft_YaHei',sans-serif] text-[var(--color-ink)] antialiased"
      style={pageVars}
    >
      <HeroSection
        copy={copy}
        heroRef={heroRef}
        language={language}
        maskRef={maskRef}
        setLanguage={setLanguage}
        subtitleChars={subtitle.chars}
        subtitleDone={subtitle.isDone}
        visibleSubtitleCount={subtitle.visibleCount}
      />
      <FeatureSection copy={copy} />
      <HomeFooter />
    </main>
  );
}
