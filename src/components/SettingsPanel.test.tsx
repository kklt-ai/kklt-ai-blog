import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getThemeById } from "@/lib/themes";
import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  const baseProps = {
    selectedThemeId: "punk",
    activeTheme: getThemeById("punk"),
    dimensions: { width: 1080, height: 1440 },
    fixedSizeEnabled: false,
    autoPaginate: true,
    isExporting: false,
    syntaxOverrides: {},
    onThemeChange: vi.fn(),
    onDimensionsChange: vi.fn(),
    onFixedSizeEnabledChange: vi.fn(),
    onAutoPaginateChange: vi.fn(),
    onSyntaxOverrideChange: vi.fn(),
    onResetSyntaxOverrides: vi.fn(),
    onExportCurrent: vi.fn(),
    onExportAll: vi.fn(),
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

  it("updates Markdown syntax style controls", () => {
    const onSyntaxOverrideChange = vi.fn();

    render(
      <SettingsPanel
        {...baseProps}
        onSyntaxOverrideChange={onSyntaxOverrideChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("高亮背景色"), {
      target: { value: "#ffee66" },
    });
    fireEvent.change(screen.getByLabelText("图片圆角"), {
      target: { value: "28" },
    });

    expect(onSyntaxOverrideChange).toHaveBeenCalledWith("highlightBackground", "#ffee66");
    expect(onSyntaxOverrideChange).toHaveBeenCalledWith("imageRadius", 28);
  });

  it("disables export buttons while exporting", () => {
    render(<SettingsPanel {...baseProps} isExporting />);

    expect(screen.getByRole("button", { name: "导出当前页" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "导出全部 PNG" })).toBeDisabled();
  });
});
