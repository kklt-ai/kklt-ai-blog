"use client";

import { useRef } from "react";
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Highlighter,
  Image,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  FileUp,
  RotateCcw,
  ScissorsLineDashed,
  Undo2,
} from "lucide-react";

type EditorPanelProps = {
  markdown: string;
  error: string | null;
  onMarkdownChange: (value: string) => void;
  onUploadError: (message: string | null) => void;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
};

export function EditorPanel({
  markdown,
  error,
  onMarkdownChange,
  onUploadError,
  onReset,
  onUndo,
  canUndo,
}: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSelectionRef = useRef({ start: markdown.length, end: markdown.length });

  const rememberSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    lastSelectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  };

  const replaceSelection = (
    nextValue: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    lastSelectionRef.current = { start: selectionStart, end: selectionEnd };
    onMarkdownChange(nextValue);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const wrapSelection = (prefix: string, suffix: string, placeholder: string) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? markdown.length;
    const end = textarea?.selectionEnd ?? markdown.length;
    const selected = markdown.slice(start, end) || placeholder;
    const nextValue = `${markdown.slice(0, start)}${prefix}${selected}${suffix}${markdown.slice(end)}`;
    const nextStart = start + prefix.length;
    const nextEnd = nextStart + selected.length;
    replaceSelection(nextValue, nextStart, nextEnd);
  };

  const prefixSelectedLines = (
    buildPrefix: (lineIndex: number) => string,
    placeholder = "列表项",
  ) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? markdown.length;
    const end = textarea?.selectionEnd ?? markdown.length;
    const lineStart = markdown.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const selected = markdown.slice(lineStart, end) || placeholder;
    const lines = selected.split("\n");
    const formatted = lines
      .map((line, index) => `${buildPrefix(index)}${line.replace(/^(#{1,6}\s+|>\s+|- \s*|\d+\.\s+)/, "")}`)
      .join("\n");
    const nextValue = `${markdown.slice(0, lineStart)}${formatted}${markdown.slice(end)}`;
    replaceSelection(nextValue, lineStart, lineStart + formatted.length);
  };

  const insertSnippet = (snippet: string, selectStartOffset = 0, selectLength = 0) => {
    const textarea = textareaRef.current;
    const selection = textarea
      ? { start: textarea.selectionStart, end: textarea.selectionEnd }
      : lastSelectionRef.current;
    const start = selection.start;
    const end = selection.end;
    const nextValue = `${markdown.slice(0, start)}${snippet}${markdown.slice(end)}`;
    replaceSelection(
      nextValue,
      start + selectStartOffset,
      start + selectStartOffset + selectLength,
    );
  };

  const insertImageDivider = () => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? markdown.length;
    const end = textarea?.selectionEnd ?? markdown.length;
    const before = markdown.slice(0, start);
    const after = markdown.slice(end);
    const prefix = before.endsWith("\n\n") || before.length === 0 ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    const suffix = after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
    const snippet = `${prefix}---${suffix}`;
    const nextValue = `${before}${snippet}${after}`;
    const cursor = before.length + snippet.length;
    replaceSelection(nextValue, cursor, cursor);
  };

  const insertImageDataUrl = (file: File, dataUrl: string) => {
    const alt = file.name.replace(/\.[^.]+$/, "") || "本地图片";
    const { start, end } = lastSelectionRef.current;
    const snippet = `![${alt}](${dataUrl})`;
    const nextValue = `${markdown.slice(0, start)}${snippet}${markdown.slice(end)}`;
    const cursor = start + snippet.length;
    replaceSelection(nextValue, cursor, cursor);
  };

  const handleShortcut = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const command = event.metaKey || event.ctrlKey;
    if (!command) return;

    const key = event.key.toLowerCase();
    if (key === "z" && !event.shiftKey) {
      event.preventDefault();
      onUndo();
    } else if (event.shiftKey && event.key === "Enter") {
      event.preventDefault();
      insertImageDivider();
    } else if (key === "b") {
      event.preventDefault();
      wrapSelection("**", "**", "粗体文字");
    } else if (key === "i") {
      event.preventDefault();
      wrapSelection("*", "*", "斜体文字");
    } else if (event.shiftKey && key === "h") {
      event.preventDefault();
      wrapSelection("==", "==", "高亮文字");
    } else if (event.shiftKey && key === "x") {
      event.preventDefault();
      wrapSelection("~~", "~~", "删除文字");
    } else if (event.shiftKey && key === "7") {
      event.preventDefault();
      prefixSelectedLines((index) => `${index + 1}. `);
    } else if (event.shiftKey && key === "8") {
      event.preventDefault();
      prefixSelectedLines(() => "- ");
    } else if (event.altKey && key === "1") {
      event.preventDefault();
      prefixSelectedLines(() => "# ", "一级标题");
    } else if (event.altKey && key === "2") {
      event.preventDefault();
      prefixSelectedLines(() => "## ", "二级标题");
    }
  };

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

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onUploadError("请上传图片文件");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      if (!result.startsWith("data:image/")) {
        onUploadError("图片读取失败，请重试");
        return;
      }

      onUploadError(null);
      insertImageDataUrl(file, result);
    };
    reader.onerror = () => {
      onUploadError("图片读取失败，请重试");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const formatButtons = [
    {
      label: "一级标题",
      title: "一级标题 (Cmd/Ctrl+Alt+1)",
      icon: <Heading1 aria-hidden="true" size={17} />,
      action: () => prefixSelectedLines(() => "# ", "一级标题"),
    },
    {
      label: "二级标题",
      title: "二级标题 (Cmd/Ctrl+Alt+2)",
      icon: <Heading2 aria-hidden="true" size={17} />,
      action: () => prefixSelectedLines(() => "## ", "二级标题"),
    },
    {
      label: "粗体",
      title: "粗体 (Cmd/Ctrl+B)",
      icon: <Bold aria-hidden="true" size={17} />,
      action: () => wrapSelection("**", "**", "粗体文字"),
    },
    {
      label: "斜体",
      title: "斜体 (Cmd/Ctrl+I)",
      icon: <Italic aria-hidden="true" size={17} />,
      action: () => wrapSelection("*", "*", "斜体文字"),
    },
    {
      label: "删除线",
      title: "删除线 (Cmd/Ctrl+Shift+X)",
      icon: <Strikethrough aria-hidden="true" size={17} />,
      action: () => wrapSelection("~~", "~~", "删除文字"),
    },
    {
      label: "高亮",
      title: "高亮 (Cmd/Ctrl+Shift+H)",
      icon: <Highlighter aria-hidden="true" size={17} />,
      action: () => wrapSelection("==", "==", "高亮文字"),
    },
    {
      label: "无序列表",
      title: "无序列表 (Cmd/Ctrl+Shift+8)",
      icon: <List aria-hidden="true" size={17} />,
      action: () => prefixSelectedLines(() => "- "),
    },
    {
      label: "有序列表",
      title: "有序列表 (Cmd/Ctrl+Shift+7)",
      icon: <ListOrdered aria-hidden="true" size={17} />,
      action: () => prefixSelectedLines((index) => `${index + 1}. `),
    },
    {
      label: "引用",
      title: "引用",
      icon: <Quote aria-hidden="true" size={17} />,
      action: () => prefixSelectedLines(() => "> ", "引用内容"),
    },
    {
      label: "行内代码",
      title: "行内代码",
      icon: <Code2 aria-hidden="true" size={17} />,
      action: () => wrapSelection("`", "`", "code"),
    },
    {
      label: "图片",
      title: "图片（上传本地图片）",
      icon: <Image aria-hidden="true" size={17} />,
      upload: true,
    },
    {
      label: "切分图片",
      title: "切分图片 (Cmd/Ctrl+Shift+Enter)",
      icon: <ScissorsLineDashed aria-hidden="true" size={17} />,
      action: insertImageDivider,
    },
  ];

  return (
    <section className="workspace-panel editor-panel" aria-label="Markdown 编辑面板">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Write</p>
          <h1>Markdown</h1>
        </div>
        <div className="toolbar">
          <button
            className="icon-button icon-button--compact"
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="撤销 (Cmd/Ctrl+Z)"
          >
            <Undo2 aria-hidden="true" size={18} />
            <span className="sr-only">撤销</span>
          </button>
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
          <button
            className="icon-button icon-button--compact"
            type="button"
            onClick={onReset}
            title="恢复示例"
          >
            <RotateCcw aria-hidden="true" size={18} />
            <span className="sr-only">恢复示例</span>
          </button>
        </div>
      </div>

      {error ? <p className="inline-error">{error}</p> : null}

      <div className="markdown-format-toolbar" aria-label="Markdown 格式工具栏">
        {formatButtons.map((button) =>
          "upload" in button ? (
            <label
              key={button.label}
              className="format-button"
              title={button.title}
              aria-label={button.label}
            >
              {button.icon}
              <input
                aria-label="上传本地图片"
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
            </label>
          ) : (
            <button
              key={button.label}
              className="format-button"
              type="button"
              onClick={button.action}
              title={button.title}
              aria-label={button.label}
            >
              {button.icon}
            </button>
          ),
        )}
      </div>

      <label className="sr-only" htmlFor="markdown-editor">
        Markdown 内容
      </label>
      <textarea
        ref={textareaRef}
        id="markdown-editor"
        aria-label="Markdown 内容"
        className="markdown-input"
        value={markdown}
        spellCheck={false}
        onChange={(event) => {
          rememberSelection();
          onMarkdownChange(event.target.value);
        }}
        onKeyDown={handleShortcut}
        onClick={rememberSelection}
        onKeyUp={rememberSelection}
        onSelect={rememberSelection}
      />

    </section>
  );
}
