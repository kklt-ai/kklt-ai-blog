import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadNodeAsPng } from "@/lib/export";
import { CoverEditor } from "./CoverEditor";

vi.mock("@/lib/export", () => ({
  downloadNodeAsPng: vi.fn().mockResolvedValue(undefined),
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
    expect(screen.getByRole("button", { name: /小红书/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /公众号/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /AI 爆款封面/ })).toBeInTheDocument();
    expect(screen.getByLabelText("封面画布")).toBeInTheDocument();
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

  it("adds and edits a text layer from the preview canvas", () => {
    render(<CoverEditor />);

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

    fireEvent.click(screen.getByRole("button", { name: "添加 OpenAI 图标" }));

    expect(screen.getByLabelText("OpenAI 图标图层")).toBeInTheDocument();
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

    await waitFor(() => expect(downloadNodeAsPng).toHaveBeenCalledTimes(1));
    const exportedNode = vi.mocked(downloadNodeAsPng).mock.calls[0][0];
    const previewCanvas = screen.getByLabelText("封面画布");

    expect(exportedNode).not.toBe(previewCanvas);
    expect(exportedNode).toHaveClass("cover-export-node");
    expect(exportedNode).toHaveStyle({ width: "1242px", height: "1660px" });
    expect(exportedNode.style.transform).toBe("");
  });
});
