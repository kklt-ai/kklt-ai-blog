import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CUSTOM_COVER_TEMPLATES_STORAGE_KEY } from "@/cover/lib/customTemplates";
import { CoverEditor } from "./CoverEditor";

vi.mock("@/cover/lib/export", () => ({
  downloadCoverNodeAsPng: vi.fn().mockResolvedValue(undefined),
}));

describe("CoverEditor custom templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("keeps template actions in the preview panel and confirms before saving", async () => {
    render(<CoverEditor />);

    const previewPanel = screen.getByLabelText("封面预览面板");
    const leftPanel = screen.getByRole("complementary", { name: "" });
    const saveButton = within(previewPanel).getByRole("button", { name: "保存为模板" });
    const copyButton = within(previewPanel).getByRole("button", { name: "复制模板配置" });

    expect(within(leftPanel).queryByRole("button", { name: "保存为模板" })).not.toBeInTheDocument();
    expect(saveButton).toHaveClass("inline-flex", "h-10", "rounded-md");
    expect(saveButton.closest("[data-cover-preview-toolbar='true']")).toHaveClass(
      "absolute",
      "right-5",
      "top-5",
    );
    expect(copyButton).toHaveAttribute("title", "复制当前模板配置");
    expect(copyButton.textContent).toBe("");

    fireEvent.click(saveButton);

    const dialog = screen.getByRole("dialog", { name: "保存为模板" });
    expect(
      within(dialog).getByText("这个功能会把当前封面的文字、图标、背景和特效保存到浏览器里。"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("保存后会出现在“我的模板”，下次打开这个浏览器也能继续复用。"),
    ).toBeInTheDocument();
    expect(localStorage.getItem(CUSTOM_COVER_TEMPLATES_STORAGE_KEY)).toBeNull();

    fireEvent.click(within(dialog).getByRole("button", { name: "确认保存" }));

    expect(screen.getByText("我的模板")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /我的模板 1/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(localStorage.getItem(CUSTOM_COVER_TEMPLATES_STORAGE_KEY)).toContain("我的模板 1");

    fireEvent.click(copyButton);

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("status")).toHaveTextContent("模板代码复制成功");
    const copiedText = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0];
    expect(copiedText).toContain('"name": "我的模板 1"');
    expect(copiedText).toContain('"channel": "xiaohongshu"');
    expect(copiedText).toContain('"layers"');
  });

  it("does not save a duplicate template", () => {
    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "保存为模板" }));
    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));
    fireEvent.click(screen.getByRole("button", { name: "保存为模板" }));
    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));

    expect(screen.getByText("这个模板已经在模板库里了，不会重复添加。")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /我的模板 1/ })).toHaveLength(1);
    expect(localStorage.getItem(CUSTOM_COVER_TEMPLATES_STORAGE_KEY)).not.toContain("我的模板 2");
  });

  it("falls back to a temporary textarea when clipboard copying is unavailable", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error("denied"));
    Object.assign(document, {
      execCommand: vi.fn().mockReturnValue(true),
    });

    render(<CoverEditor />);

    fireEvent.click(screen.getByRole("button", { name: "保存为模板" }));
    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));
    fireEvent.click(screen.getByRole("button", { name: "复制模板配置" }));

    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith("copy"));
    expect(document.querySelector("textarea[aria-hidden='true']")).not.toBeInTheDocument();
  });

  it("loads browser-saved templates when the cover editor opens", () => {
    localStorage.setItem(
      CUSTOM_COVER_TEMPLATES_STORAGE_KEY,
      JSON.stringify([
        {
          id: "custom-xiaohongshu-existing",
          name: "我的模板 9",
          channel: "xiaohongshu",
          description: "从当前封面保存",
          backgroundClassName: "bg-white",
          layers: [
            {
              id: "custom-xiaohongshu-existing-title",
              type: "text",
              text: "本地保存标题",
              x: 12,
              y: 22,
              width: 76,
              fontSize: 88,
              color: "#111111",
              fontFamily: "rounded",
              bold: true,
              italic: false,
              underline: false,
              align: "center",
              lineHeight: 1.08,
              letterSpacing: 0,
              textEffect: "none",
              highlightEffect: "none",
            },
          ],
        },
      ]),
    );

    render(<CoverEditor />);

    expect(screen.getByText("我的模板")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /我的模板 9/ }));

    expect(screen.getByRole("button", { name: "本地保存标题 文字图层" })).toBeInTheDocument();
  });
});
