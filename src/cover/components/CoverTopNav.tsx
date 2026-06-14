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
    <header className="relative z-30 shrink-0 border-b border-[#f3f0ef] bg-[#fcfaf8]/95 shadow-[0_12px_34px_rgba(38,37,30,0.06)] backdrop-blur">
      <nav
        aria-label="封面顶部导航"
        className="grid min-h-[56px] grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] items-center gap-2 px-4 py-2 max-lg:grid max-lg:grid-cols-[1fr_auto] max-sm:gap-2 max-sm:px-3"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-normal text-[#26251e]">封面设计</p>
          <p className="truncate text-[10px] font-medium text-[#504f49] max-sm:hidden">
            {channel.name}封面 · {channel.width}×{channel.height}px
          </p>
        </div>

        <div
          role="group"
          aria-label="平台切换"
          className="grid min-h-8 w-[204px] grid-cols-2 rounded-md border border-[#979696]/45 bg-[#f3f0ef] p-0.5 justify-self-center max-sm:order-3 max-sm:col-span-2 max-sm:w-full"
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
                "truncate rounded-md px-3 py-1.5 text-sm font-semibold transition",
                item.id === channelId
                  ? "bg-[#26251e] text-white shadow-sm"
                  : "text-[#504f49] hover:bg-white/80 hover:text-[#26251e]",
              ].join(" ")}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 justify-self-end">
          <Link
            href="/"
            className="inline-flex h-8 items-center justify-center rounded-full border border-[#979696] bg-transparent px-3 text-sm font-semibold text-[#26251e] transition hover:border-[#26251e] hover:bg-[#26251e] hover:text-[#fafafa] max-[420px]:px-3"
          >
            MD 申请卡片
          </Link>
          <button
            type="button"
            aria-label="导出 PNG"
            onClick={onExportCover}
            disabled={isExporting}
            className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-[#26251e] px-3 text-sm font-semibold text-[#fafafa] shadow-sm transition hover:bg-[#3a3933] disabled:opacity-60 max-[420px]:px-3"
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
