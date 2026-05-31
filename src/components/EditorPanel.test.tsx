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
        onUndo={vi.fn()}
        canUndo={false}
      />,
    );

    fireEvent.change(screen.getByLabelText("Markdown 内容"), {
      target: { value: "# Changed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "恢复示例" }));

    expect(onMarkdownChange).toHaveBeenCalledWith("# Changed");
    expect(onReset).toHaveBeenCalled();
  });

  it("wraps selected text from the Markdown toolbar", () => {
    const onMarkdownChange = vi.fn();

    render(
      <EditorPanel
        markdown="# Hello"
        error={null}
        onMarkdownChange={onMarkdownChange}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={vi.fn()}
        canUndo={false}
      />,
    );

    const editor = screen.getByLabelText("Markdown 内容") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(2, 7);

    fireEvent.click(screen.getByRole("button", { name: "粗体" }));

    expect(onMarkdownChange).toHaveBeenCalledWith("# **Hello**");
  });

  it("wraps selected text with HTML underline markup from the toolbar", () => {
    const onMarkdownChange = vi.fn();

    render(
      <EditorPanel
        markdown="Underline me"
        error={null}
        onMarkdownChange={onMarkdownChange}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={vi.fn()}
        canUndo={false}
      />,
    );

    const editor = screen.getByLabelText("Markdown 内容") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(0, 9);

    fireEvent.click(screen.getByRole("button", { name: "下划线" }));

    expect(onMarkdownChange).toHaveBeenCalledWith("<u>Underline</u> me");
  });

  it("inserts a Markdown table from the format toolbar", () => {
    const onMarkdownChange = vi.fn();

    render(
      <EditorPanel
        markdown="Intro"
        error={null}
        onMarkdownChange={onMarkdownChange}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={vi.fn()}
        canUndo={false}
      />,
    );

    const editor = screen.getByLabelText("Markdown 内容") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(5, 5);

    fireEvent.click(screen.getByRole("button", { name: "表格" }));

    expect(onMarkdownChange).toHaveBeenCalledWith(
      "Intro\n\n| 项目 | 内容 |\n| --- | --- |\n| 名称 | 描述 |\n\n",
    );
  });

  it("supports keyboard shortcuts for Markdown formatting", () => {
    const onMarkdownChange = vi.fn();

    render(
      <EditorPanel
        markdown="mark me"
        error={null}
        onMarkdownChange={onMarkdownChange}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={vi.fn()}
        canUndo={false}
      />,
    );

    const editor = screen.getByLabelText("Markdown 内容") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(0, 4);

    fireEvent.keyDown(editor, { key: "h", metaKey: true, shiftKey: true });

    expect(onMarkdownChange).toHaveBeenCalledWith("==mark== me");
  });

  it("inserts Markdown dividers for image splitting from the keyboard", () => {
    const onMarkdownChange = vi.fn();

    render(
      <EditorPanel
        markdown="A"
        error={null}
        onMarkdownChange={onMarkdownChange}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={vi.fn()}
        canUndo={false}
      />,
    );

    const editor = screen.getByLabelText("Markdown 内容") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(1, 1);

    fireEvent.keyDown(editor, { key: "Enter", metaKey: true, shiftKey: true });

    expect(onMarkdownChange).toHaveBeenCalledWith("A\n\n---\n\n");
  });

  it("calls undo from the toolbar and keyboard", () => {
    const onUndo = vi.fn();

    render(
      <EditorPanel
        markdown="A"
        error={null}
        onMarkdownChange={vi.fn()}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={onUndo}
        canUndo
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "撤销" }));
    fireEvent.keyDown(screen.getByLabelText("Markdown 内容"), { key: "z", metaKey: true });

    expect(onUndo).toHaveBeenCalledTimes(2);
  });

  it("uses compact icon buttons for undo and reset actions", () => {
    render(
      <EditorPanel
        markdown="A"
        error={null}
        onMarkdownChange={vi.fn()}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={vi.fn()}
        canUndo
      />,
    );

    expect(screen.getByRole("button", { name: "撤销" })).toHaveClass(
      "icon-button--compact",
    );
    expect(screen.getByRole("button", { name: "恢复示例" })).toHaveClass(
      "icon-button--compact",
    );
  });

  it("keeps local image upload in the Markdown format toolbar only", () => {
    render(
      <EditorPanel
        markdown="A"
        error={null}
        onMarkdownChange={vi.fn()}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={vi.fn()}
        canUndo={false}
      />,
    );

    const formatToolbar = screen.getByLabelText("Markdown 格式工具栏");
    expect(screen.queryByTitle("上传本地图片")).toBeNull();
    expect(formatToolbar).toContainElement(screen.getByLabelText("上传本地图片"));
  });

  it("uploads local images as local image references", async () => {
    const onMarkdownChange = vi.fn();
    const onImageUpload = vi.fn().mockResolvedValue("local-image://cover-photo-1");

    render(
      <EditorPanel
        markdown="Intro"
        error={null}
        onMarkdownChange={onMarkdownChange}
        onImageUpload={onImageUpload}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={vi.fn()}
        canUndo={false}
      />,
    );

    const file = new File(["image-bytes"], "cover photo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("上传本地图片"), {
      target: { files: [file] },
    });

    await vi.waitFor(() => {
      expect(onImageUpload).toHaveBeenCalledWith(
        file,
        expect.stringMatching(/^data:image\/png;base64,/),
      );
      expect(onMarkdownChange).toHaveBeenCalledWith(
        "Intro\n\n![cover photo](local-image://cover-photo-1)",
      );
    });
  });

  it("inserts uploaded images as standalone Markdown image blocks", async () => {
    const onMarkdownChange = vi.fn();
    const onImageUpload = vi.fn().mockResolvedValue("local-image://cover-photo-1");

    render(
      <EditorPanel
        markdown="Intro"
        error={null}
        onMarkdownChange={onMarkdownChange}
        onImageUpload={onImageUpload}
        onUploadError={vi.fn()}
        onReset={vi.fn()}
        onUndo={vi.fn()}
        canUndo={false}
      />,
    );

    const file = new File(["image-bytes"], "cover photo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("上传本地图片"), {
      target: { files: [file] },
    });

    await vi.waitFor(() => {
      expect(onMarkdownChange).toHaveBeenCalledWith(
        "Intro\n\n![cover photo](local-image://cover-photo-1)",
      );
    });
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
        onUndo={vi.fn()}
        canUndo={false}
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
