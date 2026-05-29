import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditorPanel } from "./EditorPanel";

describe("EditorPanel", () => {
  it("updates Markdown text and can reset sample content", () => {
    const onMarkdownChange = vi.fn();
    const onReset = vi.fn();

    render(
      <EditorPanel
        markdown="# Hello"
        error={null}
        onMarkdownChange={onMarkdownChange}
        onUploadError={vi.fn()}
        onReset={onReset}
      />,
    );

    fireEvent.change(screen.getByLabelText("Markdown 内容"), {
      target: { value: "# Changed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "恢复示例" }));

    expect(onMarkdownChange).toHaveBeenCalledWith("# Changed");
    expect(onReset).toHaveBeenCalled();
  });

  it("rejects non Markdown uploads without changing content", () => {
    const onMarkdownChange = vi.fn();
    const onUploadError = vi.fn();

    render(
      <EditorPanel
        markdown="# Hello"
        error={null}
        onMarkdownChange={onMarkdownChange}
        onUploadError={onUploadError}
        onReset={vi.fn()}
      />,
    );

    const file = new File(["hello"], "note.txt", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText("上传 Markdown 文件"), {
      target: { files: [file] },
    });

    expect(onUploadError).toHaveBeenCalledWith("请上传 .md 文件");
    expect(onMarkdownChange).not.toHaveBeenCalled();
  });
});
