"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Download, Images } from "lucide-react";
import { RenderedPage } from "./RenderedPage";
import type {
  Dimensions,
  GeneratedPage,
  ThemeDefinition,
} from "@/lib/types";

type PreviewPanelProps = {
  pages: GeneratedPage[];
  selectedPageIndex: number;
  theme: ThemeDefinition;
  dimensions: Dimensions;
  pageDimensions: Dimensions[];
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
  const measuredHeight = Math.max(
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
  dimensions,
  pageDimensions,
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
      if (measuredHeight > baseDimensions.height) {
        nextDimensions[page.id] = {
          ...baseDimensions,
          height: measuredHeight,
        };
      }
    });

    setMeasuredPageDimensions((current) =>
      areDimensionsEqual(current, nextDimensions) ? current : nextDimensions,
    );
  }, [autoHeightEnabled, dimensions, pageDimensions, pages]);

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
    <section className="preview-panel" aria-label="图片预览">
      <div className="preview-export-bar">
        <span className="page-count">共 {pages.length} 张</span>
        <div className="preview-export-actions" aria-label="导出">
          <button type="button" disabled={isExporting} onClick={onExportCurrent}>
            <Download aria-hidden="true" size={15} />
            导出当前页
          </button>
          <button type="button" disabled={isExporting} onClick={onExportAll}>
            <Images aria-hidden="true" size={15} />
            导出全部 PNG
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="preview-scroll">
        {pages.map((page, index) => {
          const pageSize = resolvedPageDimensions[index] ?? dimensions;

          return (
            <div
              key={page.id}
              className={`preview-item ${index === selectedPageIndex ? "is-active" : ""}`}
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
              <RenderedPage
                page={page}
                theme={theme}
                dimensions={pageSize}
                scale={scale}
              />
            </div>
          );
        })}
      </div>

      <div className="export-pages" aria-hidden="true">
        {pages.map((page, index) => {
          const pageSize = resolvedPageDimensions[index] ?? dimensions;

          return (
            <div
              key={page.id}
              ref={(node) => {
                exportPageRefs.current[index] = node;
                registerPageRef(index, node);
              }}
              className="export-page-node"
            >
              <RenderedPage
                page={page}
                theme={theme}
                dimensions={pageSize}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
