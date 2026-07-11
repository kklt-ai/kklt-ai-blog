import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getThemeById } from "@/md-image/lib/themes";
import { PreviewPanel } from "./PreviewPanel";

describe("PreviewPanel", () => {
  const typography = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fontSize: 44,
  };
  const watermark = {
    enabled: true,
    authorName: "卡卡罗特AI",
    avatarSrc: "/watermark-avatar.jpg",
  };
  const originalResizeObserver = global.ResizeObserver;
  const originalGetComputedStyle = window.getComputedStyle;
  let scrollHeightSpy: ReturnType<typeof vi.spyOn>;
  let clientHeightSpy: ReturnType<typeof vi.spyOn>;
  let offsetHeightSpy: ReturnType<typeof vi.spyOn>;
  let boundingRectSpy: ReturnType<typeof vi.spyOn>;
  let measuredInnerScrollHeight = 1800;
  let measuredPageScrollHeight = 900;
  let measuredContentBottom = 0;

  beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation((callback: ResizeObserverCallback) => ({
      disconnect: vi.fn(),
      observe: vi.fn((element: Element) => {
        callback(
          [
            {
              target: element,
              contentRect: { width: 540 } as DOMRectReadOnly,
            } as ResizeObserverEntry,
          ],
          {} as ResizeObserver,
        );
      }),
      unobserve: vi.fn(),
    }));

    vi.spyOn(window, "getComputedStyle").mockImplementation((element: Element) => {
      if ((element as HTMLElement).classList.contains("xhs-page")) {
        const style = originalGetComputedStyle(element);
        return {
          ...style,
          borderTopWidth: "4px",
          borderBottomWidth: "4px",
          getPropertyValue: style.getPropertyValue.bind(style),
        } as CSSStyleDeclaration;
      }

      return originalGetComputedStyle(element);
    });

    measuredInnerScrollHeight = 1800;
    measuredPageScrollHeight = 900;
    measuredContentBottom = 0;

    scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function getScrollHeight() {
        if (this.classList.contains("xhs-page-inner")) return measuredInnerScrollHeight;
        if (this.classList.contains("xhs-page")) return measuredPageScrollHeight;
        return 0;
      });
    clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function getClientHeight() {
        if (this.classList.contains("preview-scroll")) return 540;
        if (this.classList.contains("xhs-page-inner")) return 700;
        if (this.classList.contains("xhs-page")) return 700;
        return 0;
      });
    offsetHeightSpy = vi
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockImplementation(function getOffsetHeight() {
        if (this.classList.contains("xhs-page")) return 708;
        return 0;
      });
    boundingRectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getBoundingClientRect() {
        const rect = {
          x: 0,
          y: 0,
          width: 1080,
          height: 0,
          top: 0,
          right: 1080,
          bottom: 0,
          left: 0,
          toJSON: () => ({}),
        } as DOMRect;

        if (this.classList.contains("xhs-page-inner")) return rect;
        if (measuredContentBottom > 0 && this.closest(".xhs-page-inner")) {
          return {
            ...rect,
            height: measuredContentBottom,
            bottom: measuredContentBottom,
          } as DOMRect;
        }
        return rect;
      });
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
    window.getComputedStyle = originalGetComputedStyle;
    scrollHeightSpy.mockRestore();
    clientHeightSpy.mockRestore();
    offsetHeightSpy.mockRestore();
    boundingRectSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("expands default long-image height to the measured rendered content", async () => {
    render(
      <PreviewPanel
        pages={[
          {
            id: "page-1",
            manualGroupIndex: 0,
            estimatedHeight: 700,
            blocks: [
              {
                type: "paragraph",
                text: "长文",
                inline: [{ type: "text", text: "长文" }],
              },
            ],
          },
        ]}
        selectedPageIndex={0}
        theme={getThemeById("punk")}
        typography={typography}
        dimensions={{ width: 1080, height: 1440 }}
        pageDimensions={[{ width: 1080, height: 760 }]}
        watermark={watermark}
        autoHeightEnabled
        isExporting={false}
        onPageChange={vi.fn()}
        registerPageRef={vi.fn()}
        onExportCurrent={vi.fn()}
        onExportPage={vi.fn()}
        onExportAll={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("共 1 张")).toBeInTheDocument();
    });
  });

  it("keeps fixed-size pages at the configured height", async () => {
    render(
      <PreviewPanel
        pages={[
          {
            id: "page-1",
            manualGroupIndex: 0,
            estimatedHeight: 700,
            blocks: [
              {
                type: "paragraph",
                text: "长文",
                inline: [{ type: "text", text: "长文" }],
              },
            ],
          },
        ]}
        selectedPageIndex={0}
        theme={getThemeById("punk")}
        typography={typography}
        dimensions={{ width: 1080, height: 1440 }}
        pageDimensions={[{ width: 1080, height: 1440 }]}
        watermark={watermark}
        autoHeightEnabled={false}
        isExporting={false}
        onPageChange={vi.fn()}
        registerPageRef={vi.fn()}
        onExportCurrent={vi.fn()}
        onExportPage={vi.fn()}
        onExportAll={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("共 1 张")).toBeInTheDocument();
    });
  });

  it("shrinks auto-height pages to short rendered content", async () => {
    measuredInnerScrollHeight = 1440;
    measuredPageScrollHeight = 1440;
    measuredContentBottom = 520;

    render(
      <PreviewPanel
        pages={[
          {
            id: "page-1",
            manualGroupIndex: 0,
            estimatedHeight: 700,
            blocks: [
              {
                type: "image",
                alt: "",
                url: "https://example.com/image.png",
              },
            ],
          },
        ]}
        selectedPageIndex={0}
        theme={getThemeById("punk")}
        typography={typography}
        dimensions={{ width: 1080, height: 1440 }}
        pageDimensions={[{ width: 1080, height: 1440 }]}
        watermark={watermark}
        autoHeightEnabled
        isExporting={false}
        onPageChange={vi.fn()}
        registerPageRef={vi.fn()}
        onExportCurrent={vi.fn()}
        onExportPage={vi.fn()}
        onExportAll={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("article")[0]).toHaveStyle({ height: "620px" });
    });
  });

  it("shows compact export actions with only the page count in the preview header", () => {
    const onExportCurrent = vi.fn();
    const onExportAll = vi.fn();

    render(
      <PreviewPanel
        pages={[
          {
            id: "page-1",
            manualGroupIndex: 0,
            estimatedHeight: 700,
            blocks: [],
          },
          {
            id: "page-2",
            manualGroupIndex: 1,
            estimatedHeight: 700,
            blocks: [],
          },
        ]}
        selectedPageIndex={0}
        theme={getThemeById("punk")}
        typography={typography}
        dimensions={{ width: 1080, height: 1440 }}
        pageDimensions={[
          { width: 1080, height: 1440 },
          { width: 1080, height: 1440 },
        ]}
        watermark={watermark}
        autoHeightEnabled={false}
        isExporting
        onPageChange={vi.fn()}
        registerPageRef={vi.fn()}
        onExportCurrent={onExportCurrent}
        onExportPage={vi.fn()}
        onExportAll={onExportAll}
      />,
    );

    expect(screen.queryByText("Preview")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "小红书图片预览" })).not.toBeInTheDocument();
    expect(screen.queryByText("1080 x 1440")).not.toBeInTheDocument();
    expect(screen.getByText("共 2 张")).toBeInTheDocument();

    const exportCurrent = screen.getByRole("button", { name: "导出当前页" });
    const exportAll = screen.getByRole("button", { name: "导出全部 ZIP" });

    expect(exportCurrent).toBeDisabled();
    expect(exportAll).toBeDisabled();

    fireEvent.click(exportCurrent);
    fireEvent.click(exportAll);

    expect(onExportCurrent).not.toHaveBeenCalled();
    expect(onExportAll).not.toHaveBeenCalled();
  });

  it("shows a compact download action only on the selected page", () => {
    const onPageChange = vi.fn();
    const onExportPage = vi.fn();

    render(
      <PreviewPanel
        pages={[
          {
            id: "page-1",
            manualGroupIndex: 0,
            estimatedHeight: 700,
            blocks: [],
          },
          {
            id: "page-2",
            manualGroupIndex: 1,
            estimatedHeight: 700,
            blocks: [],
          },
        ]}
        selectedPageIndex={0}
        theme={getThemeById("punk")}
        typography={typography}
        dimensions={{ width: 1080, height: 1440 }}
        pageDimensions={[
          { width: 1080, height: 1440 },
          { width: 1080, height: 1440 },
        ]}
        watermark={watermark}
        imageCropToFit={false}
        autoHeightEnabled={false}
        isExporting={false}
        onPageChange={onPageChange}
        registerPageRef={vi.fn()}
        onExportCurrent={vi.fn()}
        onExportPage={onExportPage}
        onExportAll={vi.fn()}
      />,
    );

    const downloadFirstPage = screen.getByRole("button", { name: "下载第 1 页" });

    expect(downloadFirstPage).toHaveClass("min-h-7", "text-[11px]", "-top-9", "right-0");
    expect(screen.queryByRole("button", { name: "下载第 2 页" })).not.toBeInTheDocument();

    fireEvent.click(downloadFirstPage);

    expect(onExportPage).toHaveBeenCalledWith(0);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("labels the selected preview page as editor chrome", () => {
    render(
      <PreviewPanel
        pages={[
          {
            id: "page-1",
            manualGroupIndex: 0,
            estimatedHeight: 700,
            blocks: [],
          },
          {
            id: "page-2",
            manualGroupIndex: 1,
            estimatedHeight: 700,
            blocks: [],
          },
        ]}
        selectedPageIndex={1}
        theme={getThemeById("punk")}
        typography={typography}
        dimensions={{ width: 1080, height: 1440 }}
        pageDimensions={[
          { width: 1080, height: 1440 },
          { width: 1080, height: 1440 },
        ]}
        watermark={watermark}
        autoHeightEnabled={false}
        isExporting={false}
        onPageChange={vi.fn()}
        registerPageRef={vi.fn()}
        onExportCurrent={vi.fn()}
        onExportPage={vi.fn()}
        onExportAll={vi.fn()}
      />,
    );

    expect(screen.getByText("当前页")).toBeInTheDocument();
  });
});
