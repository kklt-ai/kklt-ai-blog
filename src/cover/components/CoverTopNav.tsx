import Link from "next/link";
import { Download } from "lucide-react";
import type { CSSProperties } from "react";
import {
  COVER_CHANNELS,
  type CoverChannel,
  type CoverChannelId,
} from "@/cover/lib/cover";

type CoverTopNavProps = {
  channel: CoverChannel;
  channelId: CoverChannelId;
  isExporting: boolean;
  onChooseChannel: (channelId: CoverChannelId) => void;
  onExportCover: () => void;
};

export function CoverTopNav({
  channel,
  channelId,
  isExporting,
  onChooseChannel,
  onExportCover,
}: CoverTopNavProps) {
  return (
    <header className="relative z-30 shrink-0 border-b border-zinc-200 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <nav
        aria-label="封面顶部导航"
        className="grid min-h-[76px] grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] items-center gap-4 px-5 py-3 max-lg:grid max-lg:grid-cols-[1fr_auto] max-sm:gap-3 max-sm:px-3"
      >
        <div className="min-w-0">
          <p className="truncate text-lg font-black tracking-tight">封面设计</p>
          <p className="truncate text-xs font-semibold text-zinc-500 max-sm:hidden">
            {channel.name}封面 · {channel.width}×{channel.height}px
          </p>
        </div>

        <div
          role="group"
          aria-label="平台切换"
          className="grid min-h-11 w-[240px] grid-cols-2 rounded-xl bg-zinc-100 p-1 justify-self-center max-sm:order-3 max-sm:col-span-2 max-sm:w-full"
        >
          {COVER_CHANNELS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === channelId}
              onClick={() => onChooseChannel(item.id)}
              style={
                {
                  "--channel-color": item.brandColor,
                  "--channel-ink": item.brandForeground,
                } as CSSProperties
              }
              className={[
                "truncate rounded-lg px-3 py-2 text-sm font-bold transition",
                item.id === channelId
                  ? "bg-[var(--channel-color)] text-[var(--channel-ink)] shadow-sm"
                  : "text-zinc-500 hover:bg-white hover:text-zinc-950",
              ].join(" ")}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 justify-self-end">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 max-[420px]:px-3"
          >
            MD 申请卡片
          </Link>
          <button
            type="button"
            aria-label="导出 PNG"
            onClick={onExportCover}
            disabled={isExporting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2551f4] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#1d43d1] disabled:opacity-60 max-[420px]:px-3"
          >
            <Download size={17} aria-hidden="true" />
            {isExporting ? (
              "导出中..."
            ) : (
              <>
                <span>导出</span>
                <span className="max-[420px]:hidden">PNG</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
