import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadCoverNodeAsPng } from "@/cover/lib/export";
import { CoverEditor } from "./CoverEditor";

vi.mock("@/cover/lib/export", () => ({
  downloadCoverNodeAsPng: vi.fn().mockResolvedValue(undefined),
}));

describe("CoverEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the cover workspace and channel templates", () => {
    render(<CoverEditor />);

    expect(screen.queryByText("封面制作")).not.toBeInTheDocument();
    expect(screen.queryByText("选平台，改标题，导出 PNG。")).not.toBeInTheDocument();
    expect(screen.queryByText("画布")).not.toBeInTheDocument();
    const toolNav = screen.getByRole("navigation", { name: "封面功能栏" });
    expect(within(toolNav).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "模板",
      "文字",
      "图片",
      "背景",
    ]);
    expect(screen.getByRole("button", { name: /小红书/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /公众号/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /AI 爆款封面/ })).toBeInTheDocument();
    expect(screen.getByText("画板")).toBeInTheDocument();
    expect(screen.getByText("1242 × 1660 px")).toBeInTheDocument();
    expect(screen.getByLabelText("封面画布")).toBeInTheDocument();
  });

  it("switches between the retained left toolbar panels", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "文字" }));
    expect(screen.getByRole("button", { name: "添加文字" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "图片" }));
    expect(screen.getByText("图片素材")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加 OpenAI 图标" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "背景" }));
    expect(screen.getByText("背景样式")).toBeInTheDocument();
  });

  it("shows image backgrounds first and applies them to the preview and export canvases", async () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "背景" }));

    expect(screen.getByRole("button", { name: "图片背景" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "颜色背景" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("img", { name: "窗口卡片背景预览" })).toHaveAttribute(
      "src",
      "/cover/template/xiaohongshu/1.jpeg",
    );

    fireEvent.click(screen.getByRole("button", { name: "使用 窗口卡片 背景" }));

    const previewCanvas = screen.getByLabelText("封面画布");
    expect(previewCanvas.style.backgroundImage).toBe(
      'url("/cover/template/xiaohongshu/1.jpeg")',
    );
    expect(previewCanvas.style.backgroundSize).toBe("cover");
    expect(previewCanvas.style.backgroundPosition).toBe("center");

    fireEvent.click(screen.getByRole("button", { name: "导出 PNG" }));

    await waitFor(() => expect(downloadCoverNodeAsPng).toHaveBeenCalledTimes(1));
    const exportedNode = vi.mocked(downloadCoverNodeAsPng).mock.calls[0][0];
    expect(exportedNode.style.backgroundImage).toBe(
      'url("/cover/template/xiaohongshu/1.jpeg")',
    );
    expect(exportedNode.style.backgroundSize).toBe("cover");
    expect(exportedNode.style.backgroundPosition).toBe("center");
  });

  it("shows only background images for the active platform", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "背景" }));

    expect(screen.getByRole("img", { name: "窗口卡片背景预览" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "公众号横版 1背景预览" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /公众号/ }));
    fireEvent.click(screen.getByRole("button", { name: "背景" }));

    expect(screen.getByRole("img", { name: "公众号横版 1背景预览" })).toHaveAttribute(
      "src",
      "/cover/template/wechat/1040g0k031k37k0f5k81g5o9g8p1gj1ofh8vag48.jpeg",
    );
    expect(screen.queryByRole("img", { name: "窗口卡片背景预览" })).not.toBeInTheDocument();
  });

  it("uses cover-shaped background thumbnails for image and color backgrounds", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "背景" }));

    expect(screen.getByRole("img", { name: "窗口卡片背景预览" })).toHaveClass(
      "aspect-[3/4]",
    );

    fireEvent.click(screen.getByRole("button", { name: "颜色背景" }));

    expect(screen.getByRole("img", { name: "AI 爆款封面背景预览" })).toHaveClass(
      "aspect-[3/4]",
    );
  });

  it("uses platform colors and concise cover page copy", () => {
    render(<CoverEditor />);

    expect(screen.queryByText(/对标稿定设计/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /小红书/ }).getAttribute("style")).toContain(
      "--channel-color: #ff2442",
    );
    expect(screen.getByRole("button", { name: /公众号/ }).getAttribute("style")).toContain(
      "--channel-color: #07c160",
    );
    expect(screen.getByRole("main")).toHaveStyle("--cover-accent: #ff2442");

    fireEvent.click(screen.getByRole("button", { name: /公众号/ }));

    expect(screen.getByRole("main")).toHaveStyle("--cover-accent: #07c160");
    expect(screen.queryByText(/已切换到/)).not.toBeInTheDocument();
  });

  it("keeps the platform switch and export action at the top of settings", () => {
    render(<CoverEditor />);

    const settingsPanel = screen.getByRole("complementary", { name: "封面设置" });
    const topActions = within(settingsPanel).getByLabelText("封面顶部操作");
    const platformSwitch = within(topActions).getByRole("group", { name: "平台切换" });
    const exportButton = within(topActions).getByRole("button", { name: "导出 PNG" });
    const editRegion = within(settingsPanel).getByRole("region", { name: "图层编辑" });

    expect(within(platformSwitch).getByRole("button", { name: "小红书" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(platformSwitch).getByRole("button", { name: "公众号" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(topActions.compareDocumentPosition(editRegion)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(exportButton.compareDocumentPosition(editRegion)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("adds and edits a text layer from the preview canvas", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "文字" }));
    fireEvent.click(screen.getByRole("button", { name: "添加文字" }));
    expect(screen.queryByLabelText("文字内容")).not.toBeInTheDocument();

    fireEvent.doubleClick(screen.getByRole("button", { name: "新的封面标题 文字图层" }));
    fireEvent.change(screen.getByLabelText("新的封面标题 文字编辑框"), {
      target: { value: "双击编辑标题" },
    });
    fireEvent.blur(screen.getByLabelText("双击编辑标题 文字编辑框"));
    fireEvent.change(screen.getByLabelText("字号"), { target: { value: "88" } });
    fireEvent.change(screen.getByLabelText("文字颜色"), { target: { value: "#ff0055" } });
    fireEvent.click(screen.getByRole("button", { name: "斜体" }));

    const layer = screen.getByRole("button", { name: "双击编辑标题 文字图层" });
    expect(layer).toHaveStyle({ color: "rgb(255, 0, 85)", fontSize: "88px" });
    expect(layer).toHaveStyle("font-style: italic");
  });

  it("uses icon-only text operation buttons and applies text effects", () => {
    render(<CoverEditor />);

    const italicButton = screen.getByRole("button", { name: "斜体" });
    expect(italicButton.textContent).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "描边文字特效" }));

    const layer = screen.getByRole("button", { name: "AI 工具 效率翻倍 文字图层" });
    expect(layer.style.textShadow).toContain("#ffffff");
    expect(screen.getByRole("button", { name: "描边文字特效" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps the preview layer selected after leaving text edit focus", () => {
    render(<CoverEditor />);

    fireEvent.doubleClick(screen.getByRole("button", { name: "AI 工具 效率翻倍 文字图层" }));
    expect(screen.getByLabelText("AI 工具 效率翻倍 文字编辑框")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByLabelText("字号"));
    fireEvent.click(screen.getByLabelText("字号"));

    const layer = screen.getByRole("button", { name: "AI 工具 效率翻倍 文字图层" });
    expect(layer).toHaveClass("border-sky-400");
    expect(screen.getByRole("button", { name: "删除 AI 工具 效率翻倍 图层" })).toHaveClass(
      "opacity-100",
    );
  });

  it("adds a brand icon from the library", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "图片" }));
    fireEvent.click(screen.getByRole("button", { name: "添加 OpenAI 图标" }));

    expect(screen.getByLabelText("OpenAI 图标图层")).toBeInTheDocument();
  });

  it("shows bundled logo icons and links to LobeHub Icons from the image panel", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "图片" }));

    expect(screen.getByRole("link", { name: "前往 LobeHub Icons 下载 Logo" })).toHaveAttribute(
      "href",
      "https://icons.lobehub.com/",
    );
    expect(screen.getByRole("link", { name: "前往 LobeHub Icons 下载 Logo" })).toHaveAttribute(
      "title",
      "Logo下载网站",
    );
    expect(screen.getByRole("img", { name: "Alibaba logo" })).toHaveAttribute(
      "src",
      "/logo/alibaba.svg",
    );
    expect(screen.getByRole("img", { name: "OpenAI logo" })).toHaveAttribute(
      "src",
      "/logo/openai.svg",
    );
  });

  it("removes text-only logo options and filters logos from a scoped scroll area", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "图片" }));

    expect(screen.queryByRole("button", { name: "添加 ChatGPT 图标" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "添加 Claude 图标" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "添加 Gemini 图标" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Logo 素材列表")).toHaveClass(
      "overflow-y-auto",
      "overscroll-contain",
    );

    expect(screen.getByRole("searchbox", { name: "搜索 Logo" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "搜索 Logo" }), {
      target: { value: "deep" },
    });

    expect(screen.getByRole("button", { name: "添加 DeepSeek 图标" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "添加 Alibaba 图标" })).not.toBeInTheDocument();
  });

  it("deletes the selected layer from the preview canvas", () => {
    render(<CoverEditor />);

    const layer = screen.getByRole("button", { name: "AI 工具 效率翻倍 文字图层" });
    fireEvent.click(layer);

    expect(screen.queryByRole("button", { name: "删除当前图层" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "删除 AI 工具 效率翻倍 图层" }));

    expect(screen.queryByRole("button", { name: "AI 工具 效率翻倍 文字图层" })).not.toBeInTheDocument();
  });

  it("starts with a larger preview and zooms the canvas with the mouse wheel", () => {
    render(<CoverEditor />);

    const previewPanel = screen.getByLabelText("封面预览面板");
    const previewCanvas = screen.getByLabelText("封面画布");

    expect(previewCanvas).toHaveStyle({ transform: "scale(0.36)" });

    fireEvent.wheel(previewPanel, { deltaY: -100 });
    expect(previewCanvas).toHaveStyle({ transform: "scale(0.4)" });

    fireEvent.wheel(previewPanel, { deltaY: 100 });
    expect(previewCanvas).toHaveStyle({ transform: "scale(0.36)" });
  });

  it("switches to WeChat templates", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: /公众号/ }));

    expect(screen.getByRole("button", { name: /公众号深度文章/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("exports the clean full-size cover instead of the interactive preview canvas", async () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "导出 PNG" }));

    await waitFor(() => expect(downloadCoverNodeAsPng).toHaveBeenCalledTimes(1));
    const exportedNode = vi.mocked(downloadCoverNodeAsPng).mock.calls[0][0];
    const previewCanvas = screen.getByLabelText("封面画布");

    expect(exportedNode).not.toBe(previewCanvas);
    expect(exportedNode).toHaveClass("cover-export-node");
    expect(exportedNode).toHaveStyle({ width: "1242px", height: "1660px" });
    expect(exportedNode.style.transform).toBe("");
  });

  it("keeps the full-size export canvas out of the visible page layout", async () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "导出 PNG" }));

    await waitFor(() => expect(downloadCoverNodeAsPng).toHaveBeenCalledTimes(1));
    const exportedNode = vi.mocked(downloadCoverNodeAsPng).mock.calls[0][0];

    expect(exportedNode.parentElement).toHaveClass(
      "export-pages",
      "pointer-events-none",
      "fixed",
      "-left-[10000px]",
      "top-0",
    );
  });
});
