"use client";

import { FileUp, RotateCcw } from "lucide-react";

type EditorPanelProps = {
  markdown: string;
  error: string | null;
  onMarkdownChange: (value: string) => void;
  onUploadError: (message: string | null) => void;
  onReset: () => void;
};

export function EditorPanel({
  markdown,
  error,
  onMarkdownChange,
  onUploadError,
  onReset,
}: EditorPanelProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".md")) {
      onUploadError("请上传 .md 文件");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onUploadError(null);
      onMarkdownChange(String(reader.result ?? ""));
    };
    reader.onerror = () => {
      onUploadError("文件读取失败，请重试");
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <section className="workspace-panel editor-panel" aria-label="Markdown 编辑面板">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Write</p>
          <h1>Markdown</h1>
        </div>
        <div className="toolbar">
          <label className="icon-button" title="上传 Markdown 文件">
            <FileUp aria-hidden="true" size={18} />
            <span className="sr-only">上传 Markdown 文件</span>
            <input
              aria-label="上传 Markdown 文件"
              className="sr-only"
              type="file"
              accept=".md,text/markdown,text/plain"
              onChange={handleFileChange}
            />
          </label>
          <button className="icon-button" type="button" onClick={onReset} title="恢复示例">
            <RotateCcw aria-hidden="true" size={18} />
            <span>恢复示例</span>
          </button>
        </div>
      </div>

      {error ? <p className="inline-error">{error}</p> : null}

      <label className="sr-only" htmlFor="markdown-editor">
        Markdown 内容
      </label>
      <textarea
        id="markdown-editor"
        aria-label="Markdown 内容"
        className="markdown-input"
        value={markdown}
        spellCheck={false}
        onChange={(event) => onMarkdownChange(event.target.value)}
      />

      <div className="shortcut-grid" aria-label="快捷键">
        <span>Cmd/Ctrl + S 保存草稿</span>
        <span>Cmd/Ctrl + Enter 导出当前页</span>
      </div>
    </section>
  );
}
