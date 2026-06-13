import { useState } from "react";
import { ASSET_BASE, INSTALL_COMMAND } from "../content";
import { CheckIcon } from "../icons";

type CommandBarProps = {
  copiedLabel: string;
};

export function CommandBar({ copiedLabel }: CommandBarProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="flex h-[55px] w-[491px] max-w-full items-center justify-between gap-5 rounded-[10px] bg-[var(--color-chip-bg)] px-5 font-[var(--font-misans)] text-[15px] tracking-[0.4px] transition-colors duration-300 group-hover/hero:bg-white max-[640px]:mt-[54px] max-[640px]:h-[38px] max-[640px]:w-full max-[640px]:max-w-[300px] max-[640px]:px-3.5 max-[640px]:text-[10px] motion-reduce:transition-none" role="presentation">
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[#27272a]">
        <span className="text-[#27272a73]">&gt;_</span>
        {INSTALL_COMMAND}
      </span>
      <button
        className="relative inline-flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#27272a] transition-opacity duration-200 hover:opacity-70 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#26251e]"
        type="button"
        aria-label="复制命令"
        onClick={copyCommand}
      >
        <img
          className={`absolute inset-0 m-auto h-[16.667px] w-[15px] transition duration-200 ${copied ? "scale-50 opacity-0" : "scale-100 opacity-70"}`}
          src={`${ASSET_BASE}/icon-copy.svg`}
          alt=""
        />
        <CheckIcon className={`absolute inset-0 m-auto h-[18px] w-[18px] text-green-600 transition duration-200 ${copied ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
        <span className={`pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 whitespace-nowrap rounded-md bg-[#26251e] px-2.5 py-1 text-[11px] font-medium tracking-[0.2px] text-[#fafafa] transition duration-200 after:absolute after:left-1/2 after:top-full after:-ml-1 after:border-4 after:border-transparent after:border-t-[#26251e] ${copied ? "-translate-x-1/2 translate-y-0 opacity-100" : "-translate-x-1/2 translate-y-1.5 opacity-0"}`} aria-hidden="true">
          {copiedLabel}
        </span>
      </button>
    </div>
  );
}
