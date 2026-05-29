"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorPanel } from "@/components/EditorPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { clampDimensions } from "@/lib/dimensions";
import { downloadNodeAsPng } from "@/lib/export";
import { parseMarkdown } from "@/lib/markdown";
import { paginateSegments } from "@/lib/pagination";
import { DEFAULT_DIMENSIONS, SAMPLE_MARKDOWN } from "@/lib/sample";
import { getThemeById } from "@/lib/themes";
import type { Dimensions, ThemeSyntaxOverrides, ThemeSyntaxStyles } from "@/lib/types";

const STORAGE_KEY = "xhs-md-image-tool";

type StoredState = {
  markdown?: string;
  themeId?: string;
  dimensions?: Dimensions;
  autoPaginate?: boolean;
  syntaxOverridesByThemeId?: Record<string, ThemeSyntaxOverrides>;
};

export default function Home() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [themeId, setThemeId] = useState("punk");
  const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS);
  const [autoPaginate, setAutoPaginate] = useState(true);
  const [syntaxOverridesByThemeId, setSyntaxOverridesByThemeId] = useState<
    Record<string, ThemeSyntaxOverrides>
  >({});
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as StoredState;
      if (typeof parsed.markdown === "string") setMarkdown(parsed.markdown);
      if (typeof parsed.themeId === "string") setThemeId(parsed.themeId);
      if (parsed.dimensions) setDimensions(clampDimensions(parsed.dimensions));
      if (typeof parsed.autoPaginate === "boolean") setAutoPaginate(parsed.autoPaginate);
      if (parsed.syntaxOverridesByThemeId) {
        setSyntaxOverridesByThemeId(parsed.syntaxOverridesByThemeId);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        markdown,
        themeId,
        dimensions,
        autoPaginate,
        syntaxOverridesByThemeId,
      }),
    );
  }, [autoPaginate, dimensions, markdown, syntaxOverridesByThemeId, themeId]);

  const theme = useMemo(() => getThemeById(themeId), [themeId]);
  const syntaxOverrides = syntaxOverridesByThemeId[themeId] ?? {};
  const markdownForPreview = markdown.trim() ? markdown : SAMPLE_MARKDOWN;
  const segments = useMemo(() => parseMarkdown(markdownForPreview), [markdownForPreview]);
  const pages = useMemo(
    () => paginateSegments(segments, dimensions, theme, autoPaginate),
    [autoPaginate, dimensions, segments, theme],
  );

  useEffect(() => {
    setSelectedPageIndex((index) => Math.min(index, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  const registerPageRef = useCallback((index: number, node: HTMLDivElement | null) => {
    pageRefs.current[index] = node;
  }, []);

  const exportPage = useCallback(
    async (index: number) => {
      const node = pageRefs.current[index];
      if (!node) throw new Error("预览还没有准备好，请稍后重试");
      await downloadNodeAsPng(node, `xiaohongshu-page-${index + 1}.png`);
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
    setMessage(`正在导出 ${pages.length} 张图片...`);
    try {
      for (let index = 0; index < pages.length; index += 1) {
        await exportPage(index);
      }
      setMessage("全部图片已导出");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  }, [exportPage, pages.length]);

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
            autoPaginate,
            syntaxOverridesByThemeId,
          }),
        );
        setMessage("草稿已保存在本机浏览器");
      }

      if (event.key === "Enter") {
        event.preventDefault();
        void exportCurrent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    autoPaginate,
    dimensions,
    exportCurrent,
    markdown,
    syntaxOverridesByThemeId,
    themeId,
  ]);

  const updateSyntaxOverride = <Key extends keyof ThemeSyntaxStyles>(
    key: Key,
    value: ThemeSyntaxStyles[Key],
  ) => {
    setSyntaxOverridesByThemeId((current) => ({
      ...current,
      [themeId]: {
        ...(current[themeId] ?? {}),
        [key]: value,
      },
    }));
  };

  const resetSyntaxOverrides = () => {
    setSyntaxOverridesByThemeId((current) => {
      const { [themeId]: _removed, ...rest } = current;
      return rest;
    });
  };

  return (
    <main className="app-shell">
      <EditorPanel
        markdown={markdown}
        error={message}
        onMarkdownChange={(value) => {
          setMarkdown(value);
          setMessage(null);
        }}
        onUploadError={setMessage}
        onReset={() => {
          setMarkdown(SAMPLE_MARKDOWN);
          setMessage("示例内容已恢复");
        }}
      />

      <PreviewPanel
        pages={pages}
        selectedPageIndex={selectedPageIndex}
        theme={theme}
        syntaxOverrides={syntaxOverrides}
        dimensions={dimensions}
        onPageChange={setSelectedPageIndex}
        registerPageRef={registerPageRef}
      />

      <SettingsPanel
        selectedThemeId={themeId}
        activeTheme={theme}
        dimensions={dimensions}
        autoPaginate={autoPaginate}
        isExporting={isExporting}
        syntaxOverrides={syntaxOverrides}
        onThemeChange={setThemeId}
        onDimensionsChange={(next) => setDimensions(clampDimensions(next))}
        onAutoPaginateChange={setAutoPaginate}
        onSyntaxOverrideChange={updateSyntaxOverride}
        onResetSyntaxOverrides={resetSyntaxOverrides}
        onExportCurrent={exportCurrent}
        onExportAll={exportAll}
      />
    </main>
  );
}
