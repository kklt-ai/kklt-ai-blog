import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getThemeById } from "@/lib/themes";
import { PreviewPanel } from "./PreviewPanel";

describe("PreviewPanel", () => {
  const originalResizeObserver = global.ResizeObserver;
  const originalGetComputedStyle = window.getComputedStyle;
  let scrollHeightSpy: ReturnType<typeof vi.spyOn>;
  let clientHeightSpy: ReturnType<typeof vi.spyOn>;
  let offsetHeightSpy: ReturnType<typeof vi.spyOn>;

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
        return {
          borderTopWidth: "4px",
          borderBottomWidth: "4px",
        } as CSSStyleDeclaration;
      }

      return originalGetComputedStyle(element);
    });

    scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function getScrollHeight() {
        if (this.classList.contains("xhs-page-inner")) return 1800;
        if (this.classList.contains("xhs-page")) return 900;
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
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
    window.getComputedStyle = originalGetComputedStyle;
    scrollHeightSpy.mockRestore();
    clientHeightSpy.mockRestore();
    offsetHeightSpy.mockRestore();
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
        dimensions={{ width: 1080, height: 1440 }}
        pageDimensions={[{ width: 1080, height: 760 }]}
        autoHeightEnabled
        onPageChange={vi.fn()}
        registerPageRef={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("1080 x 1808")).toBeInTheDocument();
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
        dimensions={{ width: 1080, height: 1440 }}
        pageDimensions={[{ width: 1080, height: 1440 }]}
        autoHeightEnabled={false}
        onPageChange={vi.fn()}
        registerPageRef={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("1080 x 1440")).toBeInTheDocument();
    });
  });
});
