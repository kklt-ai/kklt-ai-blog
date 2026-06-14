export function HomeFooter() {
  return (
    <footer className="flex min-h-[290px] items-center justify-center bg-[#f5f4ef] px-[100px] py-10 max-[640px]:min-h-[217px] max-[640px]:p-9">
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-center text-xs font-normal tracking-[0.8px] text-[#504f49] max-[640px]:gap-[5px] max-[640px]:text-[9px] max-[640px]:tracking-[0.3px]">
        <span>Copyright©2025 卡卡罗特AI. All Rights Reserved</span>
        <span className="select-none text-[#b1b1b1]">|</span>
        <a className="text-inherit underline decoration-[0.5px] underline-offset-4 transition-colors hover:text-[var(--color-ink)]" href="#service-agreement">
          卡卡罗特AI Vibe Coding Works
        </a>
        <span className="select-none text-[#b1b1b1]">|</span>
        <a className="text-inherit underline decoration-[0.5px] underline-offset-4 transition-colors hover:text-[var(--color-ink)]" href="#privacy-policy">
          AI 内容分享与工具实验室
        </a>
        <span className="select-none text-[#b1b1b1]">|</span>
        <a className="text-inherit underline decoration-[0.5px] underline-offset-4 transition-colors hover:text-[var(--color-ink)]" href="#cookie-policy">
          Cookie Policy
        </a>
        <span className="select-none text-[#b1b1b1]">|</span>
        <button className="cursor-pointer border-0 bg-transparent p-0 font-inherit tracking-inherit text-inherit transition-colors hover:text-[var(--color-ink)]" type="button">
          Cookie Preferences
        </button>
      </div>
    </footer>
  );
}
