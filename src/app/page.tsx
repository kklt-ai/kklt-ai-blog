"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorPanel } from "@/components/EditorPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { clampDimensions, resolvePageDimensions } from "@/lib/dimensions";
import {
  downloadNodesAsZip,
  downloadNodeAsPng,
  exportPageFilename,
  exportZipFilename,
} from "@/lib/export";
import {
  deleteUnusedLocalImages,
  loadLocalImageSources,
  saveLocalImage,
  type LocalImageSources,
} from "@/lib/localImages";
import { parseMarkdown } from "@/lib/markdown";
import { paginateSegments } from "@/lib/pagination";
import { DEFAULT_DIMENSIONS, SAMPLE_MARKDOWN } from "@/lib/sample";
import { defaultTheme, getThemeById } from "@/lib/themes";
import {
  clampFontSize,
  defaultTypography,
  isFontId,
  isFontSizePreset,
  resolveTypography,
  type FontSizePreset,
} from "@/lib/typography";
import type { Dimensions, WatermarkSettings } from "@/lib/types";
import {
  DEFAULT_WATERMARK_SETTINGS,
  normalizeWatermarkSettings,
} from "@/lib/watermark";

const STORAGE_KEY = "xhs-md-image-tool";

type StoredState = {
  markdown?: string;
  themeId?: string;
  dimensions?: Dimensions;
  fixedSizeEnabled?: boolean;
  autoPaginate?: boolean;
  fontId?: string;
  fontSizePreset?: FontSizePreset;
  customFontSize?: number;
  watermark?: WatermarkSettings;
};

export default function Home() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [themeId, setThemeId] = useState(defaultTheme.id);
  const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS);
  const [fixedSizeEnabled, setFixedSizeEnabled] = useState(false);
  const [autoPaginate, setAutoPaginate] = useState(true);
  const [fontId, setFontId] = useState(defaultTypography.fontId);
  const [fontSizePreset, setFontSizePreset] = useState<FontSizePreset>(
    defaultTypography.fontSizePreset,
  );
  const [customFontSize, setCustomFontSize] = useState(defaultTypography.customFontSize);
  const [watermark, setWatermark] = useState(DEFAULT_WATERMARK_SETTINGS);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [localImageSources, setLocalImageSources] = useState<LocalImageSources>({});
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const hasCleanedLocalImages = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setHasRestoredDraft(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredState;
      if (typeof parsed.markdown === "string") setMarkdown(parsed.markdown);
      if (typeof parsed.themeId === "string") setThemeId(parsed.themeId);
      if (parsed.dimensions) setDimensions(clampDimensions(parsed.dimensions));
      if (typeof parsed.fixedSizeEnabled === "boolean") {
        setFixedSizeEnabled(parsed.fixedSizeEnabled);
      }
      if (typeof parsed.autoPaginate === "boolean") setAutoPaginate(parsed.autoPaginate);
      if (typeof parsed.fontId === "string" && isFontId(parsed.fontId)) {
        setFontId(parsed.fontId);
      }
      if (
        typeof parsed.fontSizePreset === "string" &&
        isFontSizePreset(parsed.fontSizePreset)
      ) {
        setFontSizePreset(parsed.fontSizePreset);
      }
      if (typeof parsed.customFontSize === "number") {
        setCustomFontSize(clampFontSize(parsed.customFontSize));
      }
      if (parsed.watermark) {
        setWatermark(normalizeWatermarkSettings(parsed.watermark));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasRestoredDraft(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        markdown,
        themeId,
        dimensions,
        fixedSizeEnabled,
        autoPaginate,
        fontId,
        fontSizePreset,
        customFontSize,
        watermark,
      }),
    );
  }, [
    autoPaginate,
    customFontSize,
    dimensions,
    fixedSizeEnabled,
    fontId,
    fontSizePreset,
    markdown,
    themeId,
    watermark,
  ]);

  const theme = useMemo(() => getThemeById(themeId), [themeId]);
  const typography = useMemo(
    () => resolveTypography({ fontId, fontSizePreset, customFontSize }),
    [customFontSize, fontId, fontSizePreset],
  );
  const renderTheme = useMemo(
    () => ({
      ...theme,
      fontFamily: typography.fontFamily,
      baseFontSize: typography.fontSize,
    }),
    [theme, typography],
  );
  const markdownForPreview = markdown.trim() ? markdown : SAMPLE_MARKDOWN;

  useEffect(() => {
    let isCurrent = true;

    loadLocalImageSources(markdownForPreview)
      .then((sources) => {
        if (isCurrent) setLocalImageSources(sources);
      })
      .catch(() => {
        if (isCurrent) setLocalImageSources({});
      });

    return () => {
      isCurrent = false;
    };
  }, [markdownForPreview]);

  useEffect(() => {
    if (!hasRestoredDraft || hasCleanedLocalImages.current) return;
    hasCleanedLocalImages.current = true;
    void deleteUnusedLocalImages(markdownForPreview);
  }, [hasRestoredDraft, markdownForPreview]);

  const segments = useMemo(() => parseMarkdown(markdownForPreview), [markdownForPreview]);
  const pages = useMemo(
    () => paginateSegments(segments, dimensions, renderTheme, fixedSizeEnabled && autoPaginate),
    [autoPaginate, dimensions, fixedSizeEnabled, renderTheme, segments],
  );
  const pageDimensions = useMemo(
    () =>
      pages.map((page) =>
        resolvePageDimensions(page, dimensions, renderTheme, fixedSizeEnabled),
      ),
    [dimensions, fixedSizeEnabled, pages, renderTheme],
  );

  useEffect(() => {
    setSelectedPageIndex((index) => Math.min(index, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  const registerPageRef = useCallback((index: number, node: HTMLDivElement | null) => {
    pageRefs.current[index] = node;
  }, []);

  const updateMarkdown = useCallback(
    (value: string) => {
      if (value === markdown) return;
      setUndoStack((stack) => [...stack.slice(-99), markdown]);
      setMarkdown(value);
      setMessage(null);
    },
    [markdown],
  );

  const undoMarkdown = useCallback(() => {
    setUndoStack((stack) => {
      const previous = stack.at(-1);
      if (previous === undefined) return stack;
      setMarkdown(previous);
      setMessage("已撤销");
      return stack.slice(0, -1);
    });
  }, []);

  const storeUploadedImage = useCallback(async (file: File, dataUrl: string) => {
    const record = await saveLocalImage(file, dataUrl);
    setLocalImageSources((sources) => ({
      ...sources,
      [record.ref]: record.dataUrl,
    }));
    return record.ref;
  }, []);

  const exportPage = useCallback(
    async (index: number, exportDate = new Date()) => {
      const node = pageRefs.current[index];
      if (!node) throw new Error("预览还没有准备好，请稍后重试");
      await downloadNodeAsPng(node, exportPageFilename(index, exportDate));
    },
    [],
  );

  const exportCurrent = useCallback(async () => {
    setIsExporting(true);
    setMessage("正在导出当前页...");
    try {
      await exportPage(selectedPageIndex);
      setMessage("当前页已导出");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  }, [exportPage, selectedPageIndex]);

  const exportAll = useCallback(async () => {
    setIsExporting(true);
    setMessage(`正在打包 ${pages.length} 张图片...`);
    try {
      const exportDate = new Date();
      const entries = pages.map((_, index) => {
        const node = pageRefs.current[index];
        if (!node) throw new Error("预览还没有准备好，请稍后重试");
        return {
          node,
          filename: exportPageFilename(index, exportDate),
        };
      });

      await downloadNodesAsZip(entries, exportZipFilename(exportDate));
      setMessage("全部图片已打包为 ZIP");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  }, [pages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const command = event.metaKey || event.ctrlKey;
      if (!command) return;

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            markdown,
            themeId,
            dimensions,
            fixedSizeEnabled,
            autoPaginate,
            fontId,
            fontSizePreset,
            customFontSize,
            watermark,
          }),
        );
        setMessage("草稿已保存在本机浏览器");
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void exportCurrent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    autoPaginate,
    customFontSize,
    dimensions,
    exportCurrent,
    fixedSizeEnabled,
    fontId,
    fontSizePreset,
    markdown,
    themeId,
    watermark,
  ]);

  return (
    <main className="app-shell">
      <Link
        href="/cover"
        className="fixed bottom-5 right-5 z-50 rounded-full border-4 border-black bg-[#fef15a] px-5 py-3 text-sm font-black text-black shadow-[5px_5px_0_#111] transition hover:-translate-y-0.5"
      >
        制作封面
      </Link>

      <EditorPanel
        markdown={markdown}
        error={message}
        onMarkdownChange={updateMarkdown}
        onImageUpload={storeUploadedImage}
        onUploadError={setMessage}
        onReset={() => {
          updateMarkdown(SAMPLE_MARKDOWN);
          setMessage("示例内容已恢复");
        }}
        onUndo={undoMarkdown}
        canUndo={undoStack.length > 0}
      />

      <PreviewPanel
        pages={pages}
        selectedPageIndex={selectedPageIndex}
        theme={renderTheme}
        typography={typography}
        dimensions={dimensions}
        pageDimensions={pageDimensions}
        localImageSources={localImageSources}
        watermark={watermark}
        autoHeightEnabled={!fixedSizeEnabled}
        isExporting={isExporting}
        onPageChange={setSelectedPageIndex}
        registerPageRef={registerPageRef}
        onExportCurrent={exportCurrent}
        onExportAll={exportAll}
      />

      <SettingsPanel
        selectedThemeId={themeId}
        dimensions={dimensions}
        fixedSizeEnabled={fixedSizeEnabled}
        autoPaginate={autoPaginate}
        fontId={fontId}
        fontSizePreset={fontSizePreset}
        customFontSize={customFontSize}
        watermark={watermark}
        onThemeChange={setThemeId}
        onDimensionsChange={(next) => setDimensions(clampDimensions(next))}
        onFixedSizeEnabledChange={setFixedSizeEnabled}
        onAutoPaginateChange={setAutoPaginate}
        onFontChange={setFontId}
        onFontSizePresetChange={setFontSizePreset}
        onCustomFontSizeChange={(size) => setCustomFontSize(clampFontSize(size))}
        onWatermarkChange={setWatermark}
        onWatermarkUploadError={setMessage}
      />
    </main>
  );
}
