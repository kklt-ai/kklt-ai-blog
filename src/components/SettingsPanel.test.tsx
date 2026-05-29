import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getThemeById } from "@/lib/themes";
import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  const baseProps = {
    selectedThemeId: "punk",
    activeTheme: getThemeById("punk"),
    dimensions: { width: 1080, height: 1440 },
    autoPaginate: true,
    isExporting: false,
    syntaxOverrides: {},
    onThemeChange: vi.fn(),
    onDimensionsChange: vi.fn(),
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
        onThemeChange={onThemeChange}
        onDimensionsChange={onDimensionsChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /波普艺术/ }));
    fireEvent.change(screen.getByLabelText("图片宽度"), { target: { value: "1200" } });

    expect(onThemeChange).toHaveBeenCalledWith("pop-art");
    expect(onDimensionsChange).toHaveBeenCalledWith({ width: 1200, height: 1440 });
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
