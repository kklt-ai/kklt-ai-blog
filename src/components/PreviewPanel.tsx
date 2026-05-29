"use client";

import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const s = Math.min(1, (w - 8) / dimensions.width);
      setScale(s);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dimensions.width]);

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

      <div ref={scrollRef} className="preview-scroll">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={`preview-item ${index === selectedPageIndex ? "is-active" : ""}`}
            style={{
              width: dimensions.width * scale,
              height: dimensions.height * scale,
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
              dimensions={dimensions}
              scale={scale}
            />
          </div>
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
