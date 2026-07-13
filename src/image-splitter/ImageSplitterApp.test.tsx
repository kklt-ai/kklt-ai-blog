import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ImageSplitterApp } from "./ImageSplitterApp";

describe("ImageSplitterApp", () => {
  beforeAll(() => {
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:test") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  });

  it("offers upload, grid presets, formats, and zip export", () => {
    render(<ImageSplitterApp />);

    expect(screen.getByRole("heading", { name: "自动切图" })).toBeInTheDocument();
    expect(screen.getByText("点击或拖入一张宫格图片")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下载 ZIP 压缩包" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "6 宫格" }));
    expect(screen.getByLabelText("横向列数")).toHaveValue(3);
    expect(screen.getByLabelText("纵向行数")).toHaveValue(2);
    expect(screen.getByText((_, element) => element?.textContent === "6 张图片")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "输出格式 JPG" }));
    expect(screen.getByRole("button", { name: "输出格式 JPG" })).toHaveAttribute("aria-pressed", "true");
  });

  it("lets each grid tile use independent edge trims and copy them to every tile", () => {
    const { container } = render(<ImageSplitterApp />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    fireEvent.change(input!, { target: { files: [new File(["image"], "grid.png", { type: "image/png" })] } });
    const image = screen.getByRole("img", { name: "待切割图片" });
    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 900 });
    Object.defineProperty(image, "naturalHeight", { configurable: true, value: 900 });
    fireEvent.load(image);

    fireEvent.click(screen.getByRole("button", { name: "选择第 2 格" }));
    fireEvent.change(screen.getByLabelText("左边内收像素"), { target: { value: "18" } });
    expect(screen.getByText("第 2 格")).toBeInTheDocument();
    expect(screen.getByLabelText("左边内收像素")).toHaveValue(18);
    expect(screen.getByRole("button", { name: "拖动当前格左边裁剪线" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "选择第 1 格" }));
    expect(screen.getByLabelText("左边内收像素")).toHaveValue(0);

    fireEvent.click(screen.getByRole("button", { name: "选择第 2 格" }));
    fireEvent.click(screen.getByRole("button", { name: "应用到全部格" }));
    fireEvent.click(screen.getByRole("button", { name: "选择第 3 格" }));
    expect(screen.getByLabelText("左边内收像素")).toHaveValue(18);
  });
});
