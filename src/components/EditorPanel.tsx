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
} from "lucide-react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const replaceSelection = (
    nextValue: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
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
    const start = textarea?.selectionStart ?? markdown.length;
    const end = textarea?.selectionEnd ?? markdown.length;
    const nextValue = `${markdown.slice(0, start)}${snippet}${markdown.slice(end)}`;
    replaceSelection(
      nextValue,
      start + selectStartOffset,
      start + selectStartOffset + selectLength,
    );
  };

  const handleShortcut = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const command = event.metaKey || event.ctrlKey;
    if (!command) return;

    const key = event.key.toLowerCase();
    if (key === "b") {
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
      title: "图片",
      icon: <Image aria-hidden="true" size={17} />,
      action: () => insertSnippet("![图片描述](https://example.com/image.png)", 2, 4),
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

      <div className="markdown-format-toolbar" aria-label="Markdown 格式工具栏">
        {formatButtons.map((button) => (
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
        ))}
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
        onChange={(event) => onMarkdownChange(event.target.value)}
        onKeyDown={handleShortcut}
      />

    </section>
  );
}
