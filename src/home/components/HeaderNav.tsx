import { Dispatch, SetStateAction } from "react";
import { ASSET_BASE, GITHUB_URL, HomeCopy, Language } from "../content";
import { CaretIcon } from "../icons";

type HeaderNavProps = {
  copy: HomeCopy;
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
};

const navLinkClass =
  "relative mx-1.5 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-0 bg-transparent px-3 py-2 font-['MiSans_Medium',var(--font-misans)] text-[15px] font-medium leading-none text-black no-underline after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[2.5px] after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100";

export function HeaderNav({ copy, language, setLanguage }: HeaderNavProps) {
  return (
    <>
      <a
        className="absolute left-8 top-[21px] z-[3] block text-[22px] font-medium tracking-[0.4px] text-[var(--color-ink)] no-underline max-[640px]:left-5 max-[640px]:top-[29px] max-[640px]:text-lg"
        href="/"
        aria-label="卡卡罗特AI"
        style={{ fontFamily: "var(--font-mincho)" }}
      >
        卡卡罗特AI
      </a>

      <div className="absolute left-0 right-0 top-[65px] z-[3] h-px bg-[#f3f0ef] max-[640px]:top-[66px]" aria-hidden="true" />

      <div className="absolute right-[25px] top-6 z-[4] inline-flex h-[15.32px] items-center gap-2 max-[640px]:right-[19px] max-[640px]:top-[29px] max-[640px]:gap-0">
        <nav className="inline-flex items-center gap-0 font-['MiSans_Medium',var(--font-misans)] max-[640px]:hidden" aria-label="Main navigation">
          <div className="group relative inline-flex items-center">
            <button type="button" className={navLinkClass}>
              <span>{copy.product}</span>
              <CaretIcon />
            </button>
            <div className="invisible absolute left-1/2 top-full z-10 flex min-w-40 -translate-x-1/2 translate-y-1.5 flex-col rounded-xl border border-black/10 bg-white px-2 py-3 opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition duration-300 group-hover:visible group-hover:translate-y-0.5 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0.5 group-focus-within:opacity-100" role="menu">
              <a className="block whitespace-nowrap rounded-lg px-3.5 py-2 font-[var(--font-misans)] text-[15px] font-normal text-black no-underline transition-colors hover:bg-black/5" href="#works" role="menuitem">
                Vibe Coding
              </a>
            </div>
          </div>
          <a className={navLinkClass} href={GITHUB_URL} target="_blank" rel="noreferrer">
            {copy.joinUs}
          </a>
        </nav>

        <div className="group relative inline-flex items-center text-[var(--color-ink)]">
          <button
            type="button"
            className="relative mx-1.5 inline-flex cursor-pointer items-center gap-[5px] border-0 bg-transparent px-3 py-2 after:absolute after:-bottom-0.5 after:left-1 after:right-1 after:h-[2.5px] after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 group-hover:after:scale-x-100"
            aria-label="Language"
          >
            <img className="block h-[18px] w-[18px]" src={`${ASSET_BASE}/icon-translate.svg`} alt="" />
            <CaretIcon />
          </button>
          <div className="invisible absolute right-0 top-full z-10 flex min-w-[132px] translate-y-1.5 flex-col rounded-xl border border-black/10 bg-white px-2 py-3 opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition duration-300 group-hover:visible group-hover:translate-y-0.5 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0.5 group-focus-within:opacity-100" role="menu">
            <button
              type="button"
              className={`block w-full cursor-pointer whitespace-nowrap rounded-lg border-0 bg-transparent px-3.5 py-2 text-left font-[var(--font-misans)] text-[15px] font-normal text-black transition-colors hover:bg-black/5 ${language === "zh" ? "bg-black/5" : ""}`}
              onClick={() => setLanguage("zh")}
              role="menuitem"
            >
              简体中文
            </button>
            <button
              type="button"
              className={`block w-full cursor-pointer whitespace-nowrap rounded-lg border-0 bg-transparent px-3.5 py-2 text-left font-[var(--font-misans)] text-[15px] font-normal text-black transition-colors hover:bg-black/5 ${language === "en" ? "bg-black/5" : ""}`}
              onClick={() => setLanguage("en")}
              role="menuitem"
            >
              English
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
