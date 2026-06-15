import { WECHAT_URL } from "../content";

export function HomeFooter() {
  return (
    <footer className="flex min-h-[180px] items-center justify-center bg-[#f5f4ef] px-[100px] py-10 max-[640px]:min-h-[150px] max-[640px]:px-9">
      <p className="m-0 text-center text-xs font-normal tracking-[0.8px] text-[#504f49] max-[640px]:text-[10px] max-[640px]:tracking-[0.3px]">
        <span>公众号作者：</span>
        <a
          className="text-inherit underline decoration-[0.5px] underline-offset-4 transition-colors hover:text-[var(--color-ink)]"
          href={WECHAT_URL}
          target="_blank"
          rel="noreferrer"
        >
          卡卡罗特AI
        </a>
      </p>
    </footer>
  );
}
