import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

    expect(screen.getByRole("heading", { name: "封面制作" })).toBeInTheDocument();
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
  });

  it("adds and edits a text layer through the inspector", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "添加文字" }));
    fireEvent.change(screen.getByLabelText("文字内容"), {
      target: { value: "新的封面标题" },
    });
    fireEvent.change(screen.getByLabelText("字号"), { target: { value: "88" } });
    fireEvent.change(screen.getByLabelText("文字颜色"), { target: { value: "#ff0055" } });
    fireEvent.click(screen.getByRole("button", { name: "斜体" }));

    const layer = screen.getByRole("button", { name: "新的封面标题 文字图层" });
    expect(layer).toHaveStyle({ color: "rgb(255, 0, 85)", fontSize: "88px" });
    expect(layer).toHaveStyle("font-style: italic");
  });

  it("adds a brand icon from the library", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "添加 OpenAI 图标" }));

    expect(screen.getByLabelText("OpenAI 图标图层")).toBeInTheDocument();
  });

  it("switches to WeChat templates", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: /公众号/ }));

    expect(screen.getByRole("button", { name: /公众号深度文章/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
