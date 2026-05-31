import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defaultTypography } from "@/lib/typography";
import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  const baseProps = {
    selectedThemeId: "punk",
    dimensions: { width: 1080, height: 1440 },
    fixedSizeEnabled: false,
    autoPaginate: true,
    fontId: "apple-system",
    fontSizePreset: "medium" as const,
    customFontSize: 44,
    watermark: {
      enabled: true,
      authorName: "卡卡罗特AI",
      avatarSrc: "/watermark-avatar.jpg",
    },
    onThemeChange: vi.fn(),
    onDimensionsChange: vi.fn(),
    onFixedSizeEnabledChange: vi.fn(),
    onAutoPaginateChange: vi.fn(),
    onFontChange: vi.fn(),
    onFontSizePresetChange: vi.fn(),
    onCustomFontSizeChange: vi.fn(),
    onWatermarkChange: vi.fn(),
    onWatermarkUploadError: vi.fn(),
  };

  it("changes theme and dimensions", () => {
    const onThemeChange = vi.fn();
    const onDimensionsChange = vi.fn();

    render(
      <SettingsPanel
        {...baseProps}
        fixedSizeEnabled
        onThemeChange={onThemeChange}
        onDimensionsChange={onDimensionsChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /波普艺术/ }));
    fireEvent.change(screen.getByLabelText("图片宽度"), { target: { value: "1200" } });

    expect(onThemeChange).toHaveBeenCalledWith("pop-art");
    expect(onDimensionsChange).toHaveBeenCalledWith({ width: 1200, height: 1440 });
  });

  it("puts image size first and hides fixed size controls by default", () => {
    render(<SettingsPanel {...baseProps} />);

    const sizeHeading = screen.getByRole("heading", { name: "图片尺寸" });
    const themeHeading = screen.getByRole("heading", { name: "主题风格" });

    expect(
      sizeHeading.compareDocumentPosition(themeHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByLabelText("图片宽度")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("图片高度")).not.toBeInTheDocument();
  });

  it("shows fixed size and pagination controls after enabling custom dimensions", () => {
    const onFixedSizeEnabledChange = vi.fn();
    const onAutoPaginateChange = vi.fn();

    const { rerender } = render(
      <SettingsPanel
        {...baseProps}
        onFixedSizeEnabledChange={onFixedSizeEnabledChange}
        onAutoPaginateChange={onAutoPaginateChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("指定图片宽高"));

    expect(onFixedSizeEnabledChange).toHaveBeenCalledWith(true);

    rerender(
      <SettingsPanel
        {...baseProps}
        fixedSizeEnabled
        onFixedSizeEnabledChange={onFixedSizeEnabledChange}
        onAutoPaginateChange={onAutoPaginateChange}
      />,
    );

    expect(screen.getByLabelText("图片宽度")).toHaveValue(1080);
    expect(screen.getByLabelText("图片高度")).toHaveValue(1440);

    fireEvent.click(screen.getByLabelText("内容超出时自动切分"));

    expect(onAutoPaginateChange).toHaveBeenCalledWith(false);
  });

  it("keeps Markdown syntax and export actions out of settings", () => {
    render(<SettingsPanel {...baseProps} />);

    expect(
      screen.queryByRole("heading", { name: "Markdown 样式" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("高亮背景色")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("图片圆角")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "导出当前页" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "导出全部 PNG" })).not.toBeInTheDocument();
  });

  it("changes typography font and preset size from dropdowns", () => {
    const onFontChange = vi.fn();
    const onFontSizePresetChange = vi.fn();

    render(
      <SettingsPanel
        {...baseProps}
        onFontChange={onFontChange}
        onFontSizePresetChange={onFontSizePresetChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("字体"), {
      target: { value: "like-jianjian" },
    });
    fireEvent.change(screen.getByLabelText("字体大小"), {
      target: { value: "large" },
    });

    expect(onFontChange).toHaveBeenCalledWith("like-jianjian");
    expect(onFontSizePresetChange).toHaveBeenCalledWith("large");
  });

  it("uses Apple font as the default option and omits the sans-serif option", () => {
    render(<SettingsPanel {...baseProps} fontId={defaultTypography.fontId} />);

    const fontSelect = screen.getByLabelText("字体");

    expect(fontSelect).toHaveDisplayValue("苹果字体");
    expect(screen.getByRole("option", { name: "苹果字体" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "默认中文无衬线" }),
    ).not.toBeInTheDocument();
  });

  it("shows a slider when custom font size is selected", () => {
    const onCustomFontSizeChange = vi.fn();

    render(
      <SettingsPanel
        {...baseProps}
        fontSizePreset="custom"
        customFontSize={48}
        onCustomFontSizeChange={onCustomFontSizeChange}
      />,
    );

    const slider = screen.getByLabelText("自定义字体大小");
    expect(slider).toHaveValue("48");

    fireEvent.change(slider, { target: { value: "56" } });

    expect(onCustomFontSizeChange).toHaveBeenCalledWith(56);
  });

  it("updates author watermark visibility and name", () => {
    const onWatermarkChange = vi.fn();

    render(<SettingsPanel {...baseProps} onWatermarkChange={onWatermarkChange} />);

    fireEvent.click(screen.getByLabelText("显示水印"));
    fireEvent.change(screen.getByLabelText("作者名"), {
      target: { value: "新的作者" },
    });

    expect(onWatermarkChange).toHaveBeenCalledWith({
      enabled: false,
      authorName: "卡卡罗特AI",
      avatarSrc: "/watermark-avatar.jpg",
    });
    expect(onWatermarkChange).toHaveBeenCalledWith({
      enabled: true,
      authorName: "新的作者",
      avatarSrc: "/watermark-avatar.jpg",
    });
  });

  it("removes the author avatar", () => {
    const onWatermarkChange = vi.fn();

    render(<SettingsPanel {...baseProps} onWatermarkChange={onWatermarkChange} />);

    fireEvent.click(screen.getByRole("button", { name: "移除头像" }));

    expect(onWatermarkChange).toHaveBeenCalledWith({
      enabled: true,
      authorName: "卡卡罗特AI",
      avatarSrc: null,
    });
  });

  it("uploads an author avatar as a data URL", async () => {
    const onWatermarkChange = vi.fn();
    const originalFileReader = global.FileReader;

    class MockFileReader {
      result = "data:image/png;base64,new-avatar";
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;

      readAsDataURL() {
        this.onload?.();
      }
    }

    global.FileReader = MockFileReader as typeof FileReader;

    try {
      render(<SettingsPanel {...baseProps} onWatermarkChange={onWatermarkChange} />);

      const file = new File(["avatar"], "avatar.png", { type: "image/png" });
      fireEvent.change(screen.getByLabelText("上传头像"), {
        target: { files: [file] },
      });

      expect(onWatermarkChange).toHaveBeenCalledWith({
        enabled: true,
        authorName: "卡卡罗特AI",
        avatarSrc: "data:image/png;base64,new-avatar",
      });
    } finally {
      global.FileReader = originalFileReader;
    }
  });
});
