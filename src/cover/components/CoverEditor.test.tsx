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
    expect(screen.queryByText("画板")).not.toBeInTheDocument();
    expect(screen.queryByText("1242 × 1660 px")).not.toBeInTheDocument();
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

  it("applies the dog and cat image background when choosing its template", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: /猫狗问答卡/ }));

    expect(screen.getByRole("button", { name: "这个网站的作者是谁？ 文字图层" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "卡卡罗特AI 文字图层" })).toBeInTheDocument();
    expect(screen.getByLabelText("封面画布").style.backgroundImage).toBe(
      'url("/cover/template/xiaohongshu/xhs_dog_and_cat.png")',
    );

    fireEvent.click(screen.getByRole("button", { name: "背景" }));

    expect(screen.getByRole("img", { name: "猫狗问答纸背景预览" })).toHaveAttribute(
      "src",
      "/cover/template/xiaohongshu/xhs_dog_and_cat.png",
    );
    expect(screen.getByRole("button", { name: "使用 猫狗问答纸 背景" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
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

  it("keeps page navigation, platform switch, and export action in a top navbar", () => {
    render(<CoverEditor />);

    const navbar = screen.getByRole("navigation", { name: "封面顶部导航" });
    const settingsPanel = screen.getByRole("complementary", { name: "封面设置" });
    const platformSwitch = within(navbar).getByRole("group", { name: "平台切换" });
    const exportButton = within(navbar).getByRole("button", { name: "导出 PNG" });

    expect(within(navbar).getByText("封面设计")).toBeInTheDocument();
    expect(within(navbar).getByRole("link", { name: "MD 申请卡片" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(platformSwitch).getByRole("button", { name: "小红书" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(platformSwitch).getByRole("button", { name: "公众号" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(settingsPanel).not.toContainElement(navbar);
    expect(settingsPanel).not.toContainElement(exportButton);
    expect(within(settingsPanel).queryByLabelText("平台切换")).not.toBeInTheDocument();
    expect(within(settingsPanel).queryByRole("button", { name: "导出 PNG" })).not.toBeInTheDocument();
    expect(within(settingsPanel).queryByText("编辑")).not.toBeInTheDocument();
    expect(within(settingsPanel).queryByText("文字")).not.toBeInTheDocument();
    expect(within(settingsPanel).queryByText("选择画布里的文字或图标后，可以在这里编辑。")).not.toBeInTheDocument();
  });

  it("uses compact action controls on narrow screens", () => {
    render(<CoverEditor />);

    const navbar = screen.getByRole("navigation", { name: "封面顶部导航" });
    const platformSwitch = within(navbar).getByRole("group", { name: "平台切换" });
    const exportButton = within(navbar).getByRole("button", { name: "导出 PNG" });

    expect(navbar).toHaveClass("max-lg:grid", "max-lg:grid-cols-[1fr_auto]");
    expect(platformSwitch).toHaveClass("max-sm:order-3", "max-sm:col-span-2");
    expect(within(exportButton).getByText("PNG")).toHaveClass("max-[420px]:hidden");
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
    const lineHeightSlider = screen.getByRole("slider", { name: "行间距" });
    const letterSpacingSlider = screen.getByRole("slider", { name: "字间距" });
    expect(lineHeightSlider).toHaveAttribute("aria-valuenow", "1.08");
    expect(letterSpacingSlider).toHaveAttribute("aria-valuenow", "0");

    fireEvent.mouseDown(lineHeightSlider, {
      buttons: 1,
      clientX: 100,
      pageX: 100,
    });
    expect(screen.getByLabelText("向左减少行间距")).toBeInTheDocument();
    expect(screen.getByLabelText("向右增加行间距")).toBeInTheDocument();
    fireEvent.mouseMove(lineHeightSlider, {
      buttons: 1,
      clientX: 304,
      pageX: 304,
    });
    fireEvent.mouseUp(lineHeightSlider);
    expect(screen.queryByLabelText("向左减少行间距")).not.toBeInTheDocument();

    fireEvent.mouseDown(letterSpacingSlider, {
      buttons: 1,
      clientX: 100,
      pageX: 100,
    });
    expect(screen.getByLabelText("向左减少字间距")).toBeInTheDocument();
    expect(screen.getByLabelText("向右增加字间距")).toBeInTheDocument();
    fireEvent.mouseMove(letterSpacingSlider, {
      buttons: 1,
      clientX: 244,
      pageX: 244,
    });
    fireEvent.mouseUp(letterSpacingSlider);
    fireEvent.click(screen.getByRole("button", { name: "斜体" }));

    const layer = screen.getByRole("button", { name: "双击编辑标题 文字图层" });
    expect(layer).toHaveStyle({ color: "rgb(255, 0, 85)", fontSize: "88px" });
    expect(layer).toHaveStyle("font-style: italic");
    expect(layer).toHaveStyle({ lineHeight: "1.25", letterSpacing: "12px" });
  });

  it("uses icon-only text operation buttons and applies text effects", () => {
    render(<CoverEditor />);

    const italicButton = screen.getByRole("button", { name: "斜体" });
    expect(italicButton.textContent).toBe("");

    const textDecorationGroup = screen.getByRole("group", { name: "文字装饰" });
    expect(
      within(textDecorationGroup)
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["划重点", "文字特效"]);

    const textEffectButton = screen.getByRole("button", { name: "文字特效" });
    expect(textEffectButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog", { name: "文字特效样式" })).not.toBeInTheDocument();

    fireEvent.click(textEffectButton);

    const effectPanel = screen.getByRole("dialog", { name: "文字特效样式" });
    expect(textEffectButton).toHaveAttribute("aria-expanded", "true");
    const effectCategories = within(effectPanel).getByRole("group", { name: "文字特效分类" });
    expect(
      within(effectCategories).getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["描边", "投影", "纹理", "渐变", "发光", "3D"]);
    expect(within(effectPanel).getByLabelText("文字特效样式列表")).toHaveClass(
      "max-h-[280px]",
      "overflow-y-auto",
      "overscroll-contain",
    );
    expect(within(effectPanel).getAllByRole("button", { name: /文字特效$/ })).toHaveLength(7);

    fireEvent.click(screen.getByRole("button", { name: "描边文字特效" }));

    const layer = screen.getByRole("button", { name: "AI 工具 效率翻倍 文字图层" });
    expect(layer.style.textShadow).toContain("#111111");
    expect(screen.queryByRole("dialog", { name: "文字特效样式" })).not.toBeInTheDocument();
    expect(textEffectButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(textEffectButton);
    const reopenedEffectPanel = screen.getByRole("dialog", { name: "文字特效样式" });
    const reopenedEffectCategories = within(reopenedEffectPanel).getByRole("group", {
      name: "文字特效分类",
    });
    fireEvent.click(within(reopenedEffectCategories).getByRole("button", { name: "渐变" }));
    fireEvent.click(screen.getByRole("button", { name: "银灰渐变文字特效" }));

    expect(layer.style.color).toBe("transparent");
    expect(layer.style.backgroundImage).toContain("linear-gradient");
    expect(screen.queryByRole("dialog", { name: "文字特效样式" })).not.toBeInTheDocument();
  });

  it("opens an independent highlight picker and applies a highlight effect", () => {
    render(<CoverEditor />);

    const highlightButton = screen.getByRole("button", { name: "划重点" });
    expect(highlightButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(highlightButton);

    const highlightPanel = screen.getByRole("dialog", { name: "划重点样式" });
    expect(highlightButton).toHaveAttribute("aria-expanded", "true");
    expect(within(highlightPanel).getByLabelText("划重点样式列表")).toHaveClass(
      "max-h-[280px]",
      "overflow-y-auto",
      "overscroll-contain",
    );
    expect(
      within(highlightPanel).getAllByRole("button", { name: /划重点样式$/ }),
    ).toHaveLength(13);
    expect(within(highlightPanel).getByRole("button", { name: "无划重点样式" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(within(highlightPanel).getByRole("button", { name: "黄色马克笔划重点样式" }));

    const layer = screen.getByRole("button", { name: "AI 工具 效率翻倍 文字图层" });
    expect(screen.queryByRole("dialog", { name: "划重点样式" })).not.toBeInTheDocument();
    expect(highlightButton).toHaveAttribute("aria-expanded", "false");
    expect(within(layer).getByText("AI 工具 效率翻倍")).toHaveStyle({
      backgroundColor: "rgb(254, 240, 138)",
    });

    fireEvent.click(screen.getByRole("button", { name: "文字特效" }));
    const effectPanel = screen.getByRole("dialog", { name: "文字特效样式" });
    const effectCategories = within(effectPanel).getByRole("group", { name: "文字特效分类" });
    expect(
      within(effectCategories).getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["描边", "投影", "纹理", "渐变", "发光", "3D"]);
  });

  it("closes the highlight picker when it loses focus", () => {
    render(<CoverEditor />);

    const highlightButton = screen.getByRole("button", { name: "划重点" });

    fireEvent.click(highlightButton);
    expect(screen.getByRole("dialog", { name: "划重点样式" })).toBeInTheDocument();

    fireEvent.blur(highlightButton, { relatedTarget: screen.getByLabelText("字号") });
    fireEvent.focus(screen.getByLabelText("字号"));

    expect(screen.queryByRole("dialog", { name: "划重点样式" })).not.toBeInTheDocument();
    expect(highlightButton).toHaveAttribute("aria-expanded", "false");
  });

  it("clears preview text and image active states after focus leaves the preview layer", () => {
    render(<CoverEditor />);

    const textLayer = screen.getByRole("button", { name: "AI 工具 效率翻倍 文字图层" });
    expect(textLayer).not.toHaveClass("border-sky-400");

    fireEvent.click(textLayer);
    expect(textLayer).toHaveClass("border-sky-400");

    fireEvent.focus(screen.getByLabelText("字号"));

    expect(textLayer).not.toHaveClass("border-sky-400");
    expect(screen.getByLabelText("字号")).toHaveValue(108);

    const iconLayer = screen.getByRole("button", { name: "Codex 图标图层" });
    fireEvent.click(iconLayer);
    expect(iconLayer).toHaveClass("border-sky-300");

    fireEvent.focus(screen.getByRole("button", { name: "文字" }));

    expect(iconLayer).not.toHaveClass("border-sky-300");
  });

  it("finishes text editing after leaving text edit focus", () => {
    render(<CoverEditor />);

    fireEvent.doubleClick(screen.getByRole("button", { name: "AI 工具 效率翻倍 文字图层" }));
    expect(screen.getByLabelText("AI 工具 效率翻倍 文字编辑框")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByLabelText("字号"));
    fireEvent.click(screen.getByLabelText("字号"));

    const layer = screen.getByRole("button", { name: "AI 工具 效率翻倍 文字图层" });
    expect(layer).not.toHaveClass("border-sky-400");
    expect(screen.queryByLabelText("AI 工具 效率翻倍 文字编辑框")).not.toBeInTheDocument();
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
