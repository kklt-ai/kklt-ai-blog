"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { RenderedPage } from "./RenderedPage";
import type { Dimensions, GeneratedPage, ThemeDefinition } from "@/lib/types";

type PreviewPanelProps = {
  pages: GeneratedPage[];
  selectedPageIndex: number;
  theme: ThemeDefinition;
  dimensions: Dimensions;
  onPageChange: (index: number) => void;
  registerPageRef: (index: number, node: HTMLDivElement | null) => void;
};

export function PreviewPanel({
  pages,
  selectedPageIndex,
  theme,
  dimensions,
  onPageChange,
  registerPageRef,
}: PreviewPanelProps) {
  const selectedPage = pages[selectedPageIndex] ?? pages[0];
  const previewScale = Math.min(0.42, 420 / dimensions.height, 320 / dimensions.width);
  const previewWidth = dimensions.width * previewScale;
  const previewHeight = dimensions.height * previewScale;

  return (
    <section className="preview-panel" aria-label="图片预览">
      <div className="preview-topbar">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>小红书图片预览</h2>
        </div>
        <div className="page-meta">
          <span>
            {selectedPageIndex + 1} / {pages.length}
          </span>
          <span>
            {dimensions.width} x {dimensions.height}
          </span>
        </div>
      </div>

      <div className="preview-stage">
        <button
          className="nav-button"
          type="button"
          disabled={selectedPageIndex === 0}
          onClick={() => onPageChange(selectedPageIndex - 1)}
          title="上一页"
        >
          <ChevronLeft aria-hidden="true" />
        </button>

        <div className="preview-frame" style={{ width: previewWidth, height: previewHeight }}>
          <RenderedPage page={selectedPage} theme={theme} dimensions={dimensions} scale={previewScale} />
        </div>

        <button
          className="nav-button"
          type="button"
          disabled={selectedPageIndex >= pages.length - 1}
          onClick={() => onPageChange(selectedPageIndex + 1)}
          title="下一页"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className="page-strip" aria-label="页面列表">
        {pages.map((page, index) => (
          <button
            key={page.id}
            type="button"
            className={index === selectedPageIndex ? "is-active" : ""}
            onClick={() => onPageChange(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="export-pages" aria-hidden="true">
        {pages.map((page, index) => (
          <div
            key={page.id}
            ref={(node) => registerPageRef(index, node)}
            className="export-page-node"
          >
            <RenderedPage page={page} theme={theme} dimensions={dimensions} />
          </div>
        ))}
      </div>
    </section>
  );
}
