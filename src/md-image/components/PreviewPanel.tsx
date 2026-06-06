"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Download, Images } from "lucide-react";
import { RenderedPage } from "./RenderedPage";
import type {
  Dimensions,
  GeneratedPage,
  ThemeDefinition,
  WatermarkSettings,
} from "@/md-image/lib/types";
import type { LocalImageSources } from "@/md-image/lib/localImages";
import type { ResolvedTypography } from "@/md-image/lib/typography";

const MIN_AUTO_PAGE_HEIGHT = 320;
const previewPanelClassName =
  "flex min-h-[calc(100vh-36px)] min-w-0 flex-col gap-4 border-4 border-[var(--ink)] bg-[linear-gradient(90deg,rgba(0,183,255,0.16)_1px,transparent_1px),linear-gradient(rgba(255,79,179,0.14)_1px,transparent_1px),#f2f2f2] bg-[length:28px_28px] p-[18px] shadow-[8px_8px_0_var(--ink)] max-[1080px]:min-h-0 max-sm:border-[3px] max-sm:p-3 max-sm:shadow-[5px_5px_0_var(--ink)]";
const exportButtonClassName =
  "inline-flex min-h-9 items-center justify-center gap-1.5 border-2 border-[var(--ink)] bg-[var(--electric-blue)] px-[9px] py-1.5 text-xs font-black shadow-[3px_3px_0_var(--ink)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--hot-pink)]";

type PreviewPanelProps = {
  pages: GeneratedPage[];
  selectedPageIndex: number;
  theme: ThemeDefinition;
  typography: ResolvedTypography;
  dimensions: Dimensions;
  pageDimensions: Dimensions[];
  localImageSources?: LocalImageSources;
  watermark: WatermarkSettings;
  autoHeightEnabled: boolean;
  isExporting: boolean;
  onPageChange: (index: number) => void;
  registerPageRef: (index: number, node: HTMLDivElement | null) => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
};

function measureRenderedPageHeight(node: HTMLDivElement, fallbackHeight: number) {
  const page = node.querySelector<HTMLElement>(".xhs-page");
  if (!page) return fallbackHeight;

  const inner = page.querySelector<HTMLElement>(".xhs-page-inner");
  const style = window.getComputedStyle(page);
  const borderHeight =
    Number.parseFloat(style.borderTopWidth || "0") +
    Number.parseFloat(style.borderBottomWidth || "0");
  const innerChildren = inner ? Array.from(inner.children) : [];
  const contentBottom = inner
    ? innerChildren.reduce((bottom, child) => {
        const innerTop = inner.getBoundingClientRect().top;
        const childBottom = child.getBoundingClientRect().bottom - innerTop;
        return Math.max(bottom, childBottom);
      }, 0)
    : 0;
  const innerStyle = inner ? window.getComputedStyle(inner) : null;
  const pagePadding = Number.parseFloat(
    page.style.getPropertyValue("--page-padding") || "0",
  );
  const paddingBottom =
    Number.parseFloat(innerStyle?.paddingBottom || "") || pagePadding || 0;
  const contentMeasuredHeight = contentBottom
    ? contentBottom + paddingBottom + borderHeight
    : 0;
  const measuredHeight = contentMeasuredHeight
    ? Math.max(MIN_AUTO_PAGE_HEIGHT, contentMeasuredHeight)
    : Math.max(
        fallbackHeight,
        page.scrollHeight + borderHeight,
        inner ? inner.scrollHeight + borderHeight : 0,
      );

  return Math.ceil(measuredHeight);
}

function areDimensionsEqual(
  left: Record<string, Dimensions>,
  right: Record<string, Dimensions>,
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every(
    (key) =>
      right[key] &&
      left[key].width === right[key].width &&
      left[key].height === right[key].height,
  );
}

export function PreviewPanel({
  pages,
  selectedPageIndex,
  theme,
  typography,
  dimensions,
  pageDimensions,
  localImageSources = {},
  watermark,
  autoHeightEnabled,
  isExporting,
  onPageChange,
  registerPageRef,
  onExportCurrent,
  onExportAll,
}: PreviewPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const exportPageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [scale, setScale] = useState(0.4);
  const [measurementVersion, setMeasurementVersion] = useState(0);
  const [measuredPageDimensions, setMeasuredPageDimensions] = useState<
    Record<string, Dimensions>
  >({});
  const resolvedPageDimensions = pages.map((page, index) => {
    const baseDimensions = pageDimensions[index] ?? dimensions;
    return autoHeightEnabled
      ? (measuredPageDimensions[page.id] ?? baseDimensions)
      : baseDimensions;
  });
  const selectedDimensions = resolvedPageDimensions[selectedPageIndex] ?? dimensions;

  useLayoutEffect(() => {
    if (!autoHeightEnabled) {
      setMeasuredPageDimensions((current) => (Object.keys(current).length ? {} : current));
      return;
    }

    const nextDimensions: Record<string, Dimensions> = {};

    pages.forEach((page, index) => {
      const node = exportPageRefs.current[index];
      const baseDimensions = pageDimensions[index] ?? dimensions;
      if (!node) return;

      const measuredHeight = measureRenderedPageHeight(node, baseDimensions.height);
      if (measuredHeight !== baseDimensions.height) {
        nextDimensions[page.id] = {
          ...baseDimensions,
          height: measuredHeight,
        };
      }
    });

    setMeasuredPageDimensions((current) =>
      areDimensionsEqual(current, nextDimensions) ? current : nextDimensions,
    );
  }, [autoHeightEnabled, dimensions, measurementVersion, pageDimensions, pages]);

  useEffect(() => {
    if (!autoHeightEnabled) return;

    const images = exportPageRefs.current.flatMap((node) =>
      node ? Array.from(node.querySelectorAll("img")) : [],
    );
    const update = () => setMeasurementVersion((version) => version + 1);

    images.forEach((image) => {
      if (image.complete) return;
      image.addEventListener("load", update);
      image.addEventListener("error", update);
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener("load", update);
        image.removeEventListener("error", update);
      });
    };
  }, [autoHeightEnabled, pages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const s = Math.min(1, (w - 8) / selectedDimensions.width);
      setScale(s);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedDimensions.width]);

  return (
    <section className={previewPanelClassName} aria-label="图片预览">
      <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
        <span className="border-2 border-[var(--ink)] bg-white p-2 text-xs font-black">
          共 {pages.length} 张
        </span>
        <div className="flex flex-wrap gap-2" aria-label="导出">
          <button
            className={exportButtonClassName}
            type="button"
            disabled={isExporting}
            onClick={onExportCurrent}
          >
            <Download aria-hidden="true" size={15} />
            导出当前页
          </button>
          <button
            className={`${exportButtonClassName} bg-[var(--ink)] text-white`}
            type="button"
            disabled={isExporting}
            onClick={onExportAll}
          >
            <Images aria-hidden="true" size={15} />
            导出全部 ZIP
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col items-center gap-9 overflow-y-auto overflow-x-hidden px-0 pb-[30px] pt-[38px]"
      >
        {pages.map((page, index) => {
          const pageSize = resolvedPageDimensions[index] ?? dimensions;
          const isSelected = index === selectedPageIndex;

          return (
            <div
              key={page.id}
              className={[
                "preview-item relative flex-none cursor-pointer overflow-visible shadow-[0_16px_36px_rgba(17,17,17,0.16)] transition-[box-shadow,outline-color,transform] duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[10px] focus-visible:outline-[var(--hot-pink)]",
                isSelected
                  ? "outline outline-2 outline-offset-8 outline-dashed outline-[rgba(17,17,17,0.42)] shadow-[0_18px_42px_rgba(17,17,17,0.2)]"
                  : "",
              ].join(" ")}
              style={{
                width: pageSize.width * scale,
                height: pageSize.height * scale,
              }}
              onClick={() => onPageChange(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPageChange(index);
                }
              }}
            >
              {isSelected ? (
                <span
                  className="absolute -top-8 left-3 z-[2] inline-flex min-h-6 items-center border-2 border-[rgba(17,17,17,0.55)] bg-[var(--panel)] px-2 py-[3px] text-[11px] font-black leading-none text-[var(--ink)] shadow-[3px_3px_0_rgba(17,17,17,0.14)]"
                  aria-hidden="true"
                >
                  当前页
                </span>
              ) : null}
              <RenderedPage
                page={page}
                theme={theme}
                typography={typography}
                dimensions={pageSize}
                localImageSources={localImageSources}
                watermark={watermark}
                scale={scale}
              />
            </div>
          );
        })}
      </div>

      <div className="fixed left-[-100000px] top-0 h-px w-px overflow-hidden" aria-hidden="true">
        {pages.map((page, index) => {
          const pageSize = resolvedPageDimensions[index] ?? dimensions;

          return (
            <div
              key={page.id}
              ref={(node) => {
                exportPageRefs.current[index] = node;
                registerPageRef(index, node);
              }}
              className="inline-block"
            >
              <RenderedPage
                page={page}
                theme={theme}
                typography={typography}
                dimensions={pageSize}
                localImageSources={localImageSources}
                watermark={watermark}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
