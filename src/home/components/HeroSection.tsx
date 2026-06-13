import { Dispatch, RefObject, SetStateAction } from "react";
import { HomeCopy, Language } from "../content";
import { ArrowIcon } from "../icons";
import { CommandBar } from "./CommandBar";
import { HeaderNav } from "./HeaderNav";

type HeroSectionProps = {
  copy: HomeCopy;
  heroRef: RefObject<HTMLElement>;
  language: Language;
  maskRef: RefObject<HTMLCanvasElement>;
  setLanguage: Dispatch<SetStateAction<Language>>;
  subtitleChars: string[];
  subtitleDone: boolean;
  visibleSubtitleCount: number;
};

function CtaButton({ children, href, primary }: { children: React.ReactNode; href: string; primary?: boolean }) {
  return (
    <a
      className={`group inline-flex h-10 min-w-[130px] cursor-pointer items-center justify-center whitespace-nowrap rounded-[46px] border px-[41px] py-2.5 font-['Microsoft_Sans_Serif',var(--font-misans)] text-base font-medium tracking-[0.24px] no-underline transition duration-200 hover:-translate-y-px motion-reduce:transition-none max-[640px]:h-[33px] max-[640px]:min-w-0 max-[640px]:flex-1 max-[640px]:px-3 max-[640px]:text-sm ${primary ? "is-primary border-[var(--color-ink)] bg-[var(--color-ink)] text-[#fafafa] hover:border-[#3a3933] hover:bg-[#3a3933]" : "border-[var(--color-border)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[#fafafa]"}`}
      href={href}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      target={href.startsWith("http") ? "_blank" : undefined}
    >
      {children}
      <ArrowIcon />
    </a>
  );
}

export function HeroSection({
  copy,
  heroRef,
  language,
  maskRef,
  setLanguage,
  subtitleChars,
  subtitleDone,
  visibleSubtitleCount,
}: HeroSectionProps) {
  return (
    <section ref={heroRef} className="group/hero relative isolate h-[592px] overflow-hidden max-[640px]:h-[425px]" id="hero">
      <div className="absolute inset-0 z-0 bg-[image:url('/home/assets/flying.png')] bg-[length:1440px_592px] bg-bottom bg-center bg-no-repeat max-[640px]:bottom-auto max-[640px]:top-[67px] max-[640px]:h-[218px] max-[640px]:bg-[length:530px_218px]" aria-hidden="true" />
      <canvas ref={maskRef} className="absolute inset-0 z-[1] block pointer-events-none max-[640px]:hidden motion-reduce:hidden" aria-hidden="true" />
      <HeaderNav copy={copy} language={language} setLanguage={setLanguage} />

      <div className="relative z-[2] mx-auto flex max-w-[809px] flex-col items-center gap-10 pt-[180px] max-[640px]:max-w-none max-[640px]:gap-0 max-[640px]:px-5 max-[640px]:pt-[129px]">
        <div className="flex w-full flex-col items-center gap-[30px] text-center max-[640px]:gap-[19px]">
          <h1 className="m-0 font-[var(--font-display)] text-[50px] font-normal tracking-[0.4px] text-[var(--color-ink)] max-[640px]:text-[30px]">
            MiMo Code
          </h1>
          <p
            className="m-0 min-h-[33px] max-w-[min(940px,94vw)] whitespace-nowrap text-center font-[var(--font-mincho)] text-[22px] font-medium leading-normal tracking-[0.4px] text-[var(--color-ink)] max-[640px]:min-h-0 max-[640px]:whitespace-normal max-[640px]:text-sm max-[640px]:leading-[1.6]"
            aria-label={copy.subtitle}
          >
            {subtitleChars.map((char, index) => (
              <span
                className={`inline-block max-[640px]:opacity-100 ${index < visibleSubtitleCount ? "opacity-100" : "opacity-0"}`}
                key={`${char}-${index}`}
              >
                {char}
              </span>
            ))}
            <span
              className={`ml-0.5 inline-block h-[1.05em] w-0.5 bg-current align-[-0.18em] max-[640px]:hidden ${subtitleDone ? "opacity-0" : "animate-[home-caret-blink_0.75s_step-end_infinite]"}`}
              aria-hidden="true"
            />
          </p>
        </div>

        <CommandBar copiedLabel={copy.copied} />

        <div className="flex items-center gap-5 max-[640px]:mt-5 max-[640px]:w-full max-[640px]:max-w-[300px] max-[640px]:gap-[13px]">
          <CtaButton href="https://github.com/XiaomiMiMo/MiMo-Code">GitHub</CtaButton>
          <CtaButton href="/zh/mimocode/start">{copy.docs}</CtaButton>
          <CtaButton href="/zh/#blog" primary>
            Blog
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
