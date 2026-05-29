# Xiaohongshu Markdown Image Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vercel-deployable pure frontend app that converts Markdown into styled, paginated Xiaohongshu PNG images.

**Architecture:** Scaffold a Next.js App Router project with a client-side workspace. Keep parsing, pagination, themes, dimension validation, and export helpers in focused utility modules so they can be unit tested independently from React UI.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest, Testing Library, `html-to-image`, `lucide-react`, `react-markdown`, `remark-gfm`.

---

## File Structure

- Create `package.json`: scripts and dependencies.
- Create `next.config.ts`: Next.js config for Vercel.
- Create `tsconfig.json`: TypeScript config.
- Create `postcss.config.mjs`: Tailwind PostCSS config.
- Create `tailwind.config.ts`: Tailwind content and theme extension.
- Create `vitest.config.ts`: Vitest config using jsdom.
- Create `src/app/layout.tsx`: root metadata and global shell.
- Create `src/app/page.tsx`: client workspace state orchestration.
- Create `src/app/globals.css`: global visual system, responsive layout, and theme canvas styles.
- Create `src/components/EditorPanel.tsx`: Markdown textarea, shortcut hints, upload, and reset.
- Create `src/components/PreviewPanel.tsx`: page preview, page navigation, page refs, and export target nodes.
- Create `src/components/SettingsPanel.tsx`: theme tiles, dimension controls, pagination toggle, export actions.
- Create `src/components/RenderedPage.tsx`: one fixed-size rendered image page.
- Create `src/lib/sample.ts`: sample Markdown and default settings.
- Create `src/lib/markdown.ts`: manual split and Markdown block parsing.
- Create `src/lib/pagination.ts`: block measurement and page generation.
- Create `src/lib/themes.ts`: built-in themes and lookup helpers.
- Create `src/lib/dimensions.ts`: dimension clamp helper.
- Create `src/lib/export.ts`: DOM-to-PNG browser export helpers.
- Create `src/lib/types.ts`: shared TypeScript types.
- Create `src/lib/*.test.ts`: unit tests for parsing, pagination, dimensions, and themes.

## Task 1: Scaffold the Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create project metadata and scripts**

Write `package.json`:

```json
{
  "name": "kklt-md-img",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@types/mdast": "^4.0.4",
    "html-to-image": "^1.11.13",
    "lucide-react": "^0.468.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "unified": "^11.0.5",
    "remark-parse": "^11.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "jsdom": "^24.1.1",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.7",
    "typescript": "^5.5.4",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Add framework configuration**

Write `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Write `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

Write `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        brutal: "8px 8px 0 #111111",
        "brutal-sm": "4px 4px 0 #111111",
      },
    },
  },
  plugins: [],
};

export default config;
```

Write `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 3: Add initial app shell**

Write `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小红书 Markdown 排版工具",
  description: "把 Markdown 转成适合小红书发布的多页图片。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

Write minimal `src/app/page.tsx`:

```tsx
export default function Home() {
  return <main className="min-h-screen">Xiaohongshu Markdown Image Tool</main>;
}
```

Write initial `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  --app-bg: #fef15a;
  --ink: #111111;
  --panel: #ffffff;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--app-bg);
  color: var(--ink);
  font-family: Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
}

button,
input,
textarea {
  font: inherit;
}
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 5: Run the scaffold build**

Run: `npm run build`

Expected: Next.js production build succeeds.

- [ ] **Step 6: Commit scaffold**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts vitest.config.ts src/app
git commit -m "feat: scaffold Next.js app"
```

## Task 2: Add Core Types, Defaults, Themes, and Dimension Validation

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/sample.ts`
- Create: `src/lib/themes.ts`
- Create: `src/lib/dimensions.ts`
- Create: `src/lib/themes.test.ts`
- Create: `src/lib/dimensions.test.ts`

- [ ] **Step 1: Write failing tests**

Write `src/lib/dimensions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { clampDimensions } from "./dimensions";

describe("clampDimensions", () => {
  it("clamps dimensions into the supported range", () => {
    expect(clampDimensions({ width: 200, height: 9999 })).toEqual({
      width: 600,
      height: 2400,
    });
  });

  it("normalizes non-numeric values to the default Xiaohongshu size", () => {
    expect(clampDimensions({ width: Number.NaN, height: Number.NaN })).toEqual({
      width: 1080,
      height: 1440,
    });
  });
});
```

Write `src/lib/themes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getThemeById, themes } from "./themes";

describe("themes", () => {
  it("includes the required first-version theme directions", () => {
    const ids = themes.map((theme) => theme.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "japanese-minimal",
        "iphone-notes",
        "punk",
        "memphis",
        "pop-art",
      ]),
    );
  });

  it("falls back to punk when a theme id is unknown", () => {
    expect(getThemeById("missing").id).toBe("punk");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/lib/dimensions.test.ts src/lib/themes.test.ts`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement shared types and defaults**

Write `src/lib/types.ts`:

```ts
export type Dimensions = {
  width: number;
  height: number;
};

export type MarkdownBlock =
  | { type: "heading"; depth: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; language?: string; code: string }
  | { type: "image"; alt: string; url: string };

export type GeneratedPage = {
  id: string;
  manualGroupIndex: number;
  blocks: MarkdownBlock[];
  estimatedHeight: number;
};

export type ThemeDefinition = {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    secondary: string;
    muted: string;
    border: string;
  };
  fontFamily: string;
  padding: number;
  baseFontSize: number;
  lineHeight: number;
  blockGap: number;
  radius: number;
  borderWidth: number;
  motif: "none" | "dots" | "grid" | "burst" | "notes" | "memphis";
};
```

Write `src/lib/sample.ts`:

```ts
import type { Dimensions } from "./types";

export const DEFAULT_DIMENSIONS: Dimensions = {
  width: 1080,
  height: 1440,
};

export const SAMPLE_MARKDOWN = `# 做内容的节奏

把灵感先写下来，再交给排版工具处理视觉、分页和导出。

## 今天可以这样开始

- 写一个清晰的标题
- 用列表整理重点
- 用引用强调一句金句

> 好的排版不是装饰，是帮读者更快进入状态。

-------

# 第二张图

当内容变长时，工具会自动拆成多张小红书图片。你也可以用七个横线强制分割。`;
```

- [ ] **Step 4: Implement dimensions and themes**

Write `src/lib/dimensions.ts`:

```ts
import { DEFAULT_DIMENSIONS } from "./sample";
import type { Dimensions } from "./types";

const MIN_SIZE = 600;
const MAX_SIZE = 2400;

function normalize(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.round(Math.min(MAX_SIZE, Math.max(MIN_SIZE, value)));
}

export function clampDimensions(dimensions: Dimensions): Dimensions {
  return {
    width: normalize(dimensions.width, DEFAULT_DIMENSIONS.width),
    height: normalize(dimensions.height, DEFAULT_DIMENSIONS.height),
  };
}
```

Write `src/lib/themes.ts` with eight complete theme objects using `ThemeDefinition`. Ensure ids are `punk`, `pop-art`, `memphis`, `iphone-notes`, `japanese-minimal`, `clean-editorial`, `soft-magazine`, and `high-contrast-poster`. Export `themes`, `defaultTheme`, and `getThemeById(id: string)`.

- [ ] **Step 5: Run tests to verify pass**

Run: `npm test -- src/lib/dimensions.test.ts src/lib/themes.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib package.json package-lock.json
git commit -m "feat: add theme and dimension foundations"
```

## Task 3: Add Markdown Parsing

**Files:**
- Create: `src/lib/markdown.ts`
- Create: `src/lib/markdown.test.ts`

- [ ] **Step 1: Write failing parser tests**

Write `src/lib/markdown.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseMarkdownSegment, splitManualSegments } from "./markdown";

describe("splitManualSegments", () => {
  it("splits only on standalone seven-dash dividers", () => {
    expect(splitManualSegments("A\n\n-------\n\nB")).toEqual(["A", "B"]);
    expect(splitManualSegments("A ------- B")).toEqual(["A ------- B"]);
  });
});

describe("parseMarkdownSegment", () => {
  it("parses supported Markdown block types", () => {
    const blocks = parseMarkdownSegment(`# Title

Paragraph text

- one
- two

> quote

\`\`\`ts
const x = 1;
\`\`\`

![Alt](https://example.com/a.png)`);

    expect(blocks).toEqual([
      { type: "heading", depth: 1, text: "Title" },
      { type: "paragraph", text: "Paragraph text" },
      { type: "list", ordered: false, items: ["one", "two"] },
      { type: "quote", text: "quote" },
      { type: "code", language: "ts", code: "const x = 1;" },
      { type: "image", alt: "Alt", url: "https://example.com/a.png" },
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/lib/markdown.test.ts`

Expected: FAIL because `src/lib/markdown.ts` does not exist.

- [ ] **Step 3: Implement parser**

Write `src/lib/markdown.ts`:

```ts
import type { Code, Heading, Image, List, Paragraph, Root, Text } from "mdast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { MarkdownBlock } from "./types";

export function splitManualSegments(markdown: string): string[] {
  return markdown
    .split(/\n\s*-------\s*\n/g)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function textFromChildren(children: Array<{ value?: string; children?: unknown[] }>) {
  return children
    .map((child) => {
      if (typeof child.value === "string") return child.value;
      if (Array.isArray(child.children)) {
        return textFromChildren(child.children as Array<{ value?: string; children?: unknown[] }>);
      }
      return "";
    })
    .join("")
    .trim();
}

export function parseMarkdownSegment(markdown: string): MarkdownBlock[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const blocks: MarkdownBlock[] = [];

  for (const node of tree.children) {
    if (node.type === "heading") {
      const heading = node as Heading;
      blocks.push({
        type: "heading",
        depth: Math.min(3, heading.depth) as 1 | 2 | 3,
        text: textFromChildren(heading.children),
      });
    }

    if (node.type === "paragraph") {
      const paragraph = node as Paragraph;
      const image = paragraph.children.length === 1 ? (paragraph.children[0] as Image) : null;
      if (image?.type === "image") {
        blocks.push({ type: "image", alt: image.alt ?? "", url: image.url });
      } else {
        blocks.push({ type: "paragraph", text: textFromChildren(paragraph.children) });
      }
    }

    if (node.type === "list") {
      const list = node as List;
      blocks.push({
        type: "list",
        ordered: Boolean(list.ordered),
        items: list.children.map((item) =>
          textFromChildren(item.children as Array<Text | Paragraph>),
        ),
      });
    }

    if (node.type === "blockquote") {
      blocks.push({
        type: "quote",
        text: textFromChildren(node.children as Array<Text | Paragraph>),
      });
    }

    if (node.type === "code") {
      const code = node as Code;
      blocks.push({ type: "code", language: code.lang ?? undefined, code: code.value.trim() });
    }
  }

  return blocks.filter((block) => {
    if ("text" in block) return block.text.length > 0;
    if (block.type === "code") return block.code.length > 0;
    if (block.type === "list") return block.items.length > 0;
    return true;
  });
}

export function parseMarkdown(markdown: string): MarkdownBlock[][] {
  const segments = splitManualSegments(markdown);
  return (segments.length ? segments : [markdown]).map(parseMarkdownSegment);
}
```

- [ ] **Step 4: Run parser tests**

Run: `npm test -- src/lib/markdown.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown.ts src/lib/markdown.test.ts package.json package-lock.json
git commit -m "feat: parse markdown into layout blocks"
```

## Task 4: Add Pagination

**Files:**
- Create: `src/lib/pagination.ts`
- Create: `src/lib/pagination.test.ts`

- [ ] **Step 1: Write failing pagination tests**

Write `src/lib/pagination.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { paginateSegments } from "./pagination";
import { getThemeById } from "./themes";
import type { MarkdownBlock } from "./types";

describe("paginateSegments", () => {
  it("keeps manual groups separated", () => {
    const pages = paginateSegments(
      [
        [{ type: "heading", depth: 1, text: "A" }],
        [{ type: "heading", depth: 1, text: "B" }],
      ],
      { width: 1080, height: 1440 },
      getThemeById("punk"),
      true,
    );

    expect(pages).toHaveLength(2);
    expect(pages.map((page) => page.manualGroupIndex)).toEqual([0, 1]);
  });

  it("creates extra pages for long content when auto pagination is enabled", () => {
    const blocks: MarkdownBlock[] = Array.from({ length: 30 }, (_, index) => ({
      type: "paragraph",
      text: `Paragraph ${index} `.repeat(20),
    }));

    const pages = paginateSegments(
      [blocks],
      { width: 1080, height: 900 },
      getThemeById("punk"),
      true,
    );

    expect(pages.length).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/lib/pagination.test.ts`

Expected: FAIL because `pagination.ts` does not exist.

- [ ] **Step 3: Implement pagination**

Write `src/lib/pagination.ts` with:

```ts
import type { Dimensions, GeneratedPage, MarkdownBlock, ThemeDefinition } from "./types";

function estimateBlockHeight(block: MarkdownBlock, theme: ThemeDefinition, contentWidth: number) {
  const charsPerLine = Math.max(12, Math.floor(contentWidth / (theme.baseFontSize * 0.58)));

  if (block.type === "heading") {
    const scale = block.depth === 1 ? 1.9 : block.depth === 2 ? 1.45 : 1.2;
    const lines = Math.max(1, Math.ceil(block.text.length / charsPerLine));
    return lines * theme.baseFontSize * theme.lineHeight * scale + theme.blockGap;
  }

  if (block.type === "paragraph" || block.type === "quote") {
    const lines = Math.max(1, Math.ceil(block.text.length / charsPerLine));
    return lines * theme.baseFontSize * theme.lineHeight + theme.blockGap;
  }

  if (block.type === "list") {
    const lines = block.items.reduce(
      (total, item) => total + Math.max(1, Math.ceil(item.length / Math.max(8, charsPerLine - 4))),
      0,
    );
    return lines * theme.baseFontSize * theme.lineHeight + theme.blockGap;
  }

  if (block.type === "code") {
    const lines = Math.max(1, block.code.split("\n").length);
    return lines * theme.baseFontSize * 1.45 + theme.blockGap + 24;
  }

  return Math.min(360, Math.max(180, contentWidth * 0.55)) + theme.blockGap;
}

function splitParagraph(block: MarkdownBlock, theme: ThemeDefinition, contentWidth: number, maxHeight: number) {
  if (block.type !== "paragraph" && block.type !== "quote" && block.type !== "code") return [block];
  const text = block.type === "code" ? block.code : block.text;
  const unit = block.type === "code" ? "\n" : "";
  const pieces = unit ? text.split(unit) : Array.from(text);
  const chunks: MarkdownBlock[] = [];
  let current = "";

  for (const piece of pieces) {
    const next = unit ? [current, piece].filter(Boolean).join(unit) : current + piece;
    const nextBlock =
      block.type === "code"
        ? { ...block, code: next }
        : { ...block, text: next };

    if (current && estimateBlockHeight(nextBlock, theme, contentWidth) > maxHeight) {
      chunks.push(block.type === "code" ? { ...block, code: current } : { ...block, text: current });
      current = piece;
    } else {
      current = next;
    }
  }

  if (current) {
    chunks.push(block.type === "code" ? { ...block, code: current } : { ...block, text: current });
  }

  return chunks;
}

export function paginateSegments(
  segments: MarkdownBlock[][],
  dimensions: Dimensions,
  theme: ThemeDefinition,
  autoPaginate: boolean,
): GeneratedPage[] {
  const contentWidth = dimensions.width - theme.padding * 2;
  const contentHeight = dimensions.height - theme.padding * 2;
  const pages: GeneratedPage[] = [];

  segments.forEach((segment, manualGroupIndex) => {
    let pageBlocks: MarkdownBlock[] = [];
    let pageHeight = 0;

    const flush = () => {
      pages.push({
        id: `page-${pages.length + 1}`,
        manualGroupIndex,
        blocks: pageBlocks,
        estimatedHeight: pageHeight,
      });
      pageBlocks = [];
      pageHeight = 0;
    };

    const sourceBlocks = autoPaginate
      ? segment.flatMap((block) => splitParagraph(block, theme, contentWidth, contentHeight))
      : segment;

    for (const block of sourceBlocks) {
      const blockHeight = estimateBlockHeight(block, theme, contentWidth);
      if (autoPaginate && pageBlocks.length > 0 && pageHeight + blockHeight > contentHeight) {
        flush();
      }
      pageBlocks.push(block);
      pageHeight += blockHeight;
    }

    if (pageBlocks.length > 0 || segment.length === 0) flush();
  });

  return pages.length ? pages : [{ id: "page-1", manualGroupIndex: 0, blocks: [], estimatedHeight: 0 }];
}
```

- [ ] **Step 4: Run pagination tests**

Run: `npm test -- src/lib/pagination.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pagination.ts src/lib/pagination.test.ts
git commit -m "feat: paginate markdown content"
```

## Task 5: Build Workspace Components

**Files:**
- Create: `src/components/EditorPanel.tsx`
- Create: `src/components/PreviewPanel.tsx`
- Create: `src/components/RenderedPage.tsx`
- Create: `src/components/SettingsPanel.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Implement `RenderedPage`**

Create a component that receives `page`, `theme`, `dimensions`, and an optional `scale`. It renders a fixed-size page using inline CSS variables for theme colors and maps each `MarkdownBlock` into styled headings, paragraphs, lists, quotes, code blocks, and images/placeholders.

- [ ] **Step 2: Implement `EditorPanel`**

Create a controlled textarea with upload handling:

```tsx
type EditorPanelProps = {
  markdown: string;
  error: string | null;
  onMarkdownChange: (value: string) => void;
  onUploadError: (message: string | null) => void;
  onReset: () => void;
};
```

Reject non-`.md` files with `onUploadError("请上传 .md 文件")`. Read valid files with `FileReader` and call `onMarkdownChange`.

- [ ] **Step 3: Implement `SettingsPanel`**

Create controls for themes, width, height, auto pagination, preset size, export current, and export all:

```tsx
type SettingsPanelProps = {
  selectedThemeId: string;
  dimensions: Dimensions;
  autoPaginate: boolean;
  isExporting: boolean;
  onThemeChange: (themeId: string) => void;
  onDimensionsChange: (dimensions: Dimensions) => void;
  onAutoPaginateChange: (enabled: boolean) => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
};
```

- [ ] **Step 4: Implement `PreviewPanel`**

Render selected page, page buttons, page count, dimensions, and hidden export pages. Accept refs from the parent through a callback:

```tsx
type PreviewPanelProps = {
  pages: GeneratedPage[];
  selectedPageIndex: number;
  theme: ThemeDefinition;
  dimensions: Dimensions;
  onPageChange: (index: number) => void;
  registerPageRef: (index: number, node: HTMLDivElement | null) => void;
};
```

- [ ] **Step 5: Wire `src/app/page.tsx`**

Make it a client component. Use `SAMPLE_MARKDOWN`, `parseMarkdown`, `paginateSegments`, `clampDimensions`, `getThemeById`, and the three panels. Add local storage for draft/settings. Add keyboard shortcuts for `Cmd/Ctrl + S` and `Cmd/Ctrl + Enter`.

- [ ] **Step 6: Polish `globals.css`**

Add responsive three-column layout, bold creative-workstation styling, theme tiles, icon buttons, page preview framing, mobile stacked layout, and export-only hidden page container. Ensure no text overlaps at desktop or mobile sizes.

- [ ] **Step 7: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/app src/components src/lib
git commit -m "feat: build markdown image workspace"
```

## Task 6: Add Browser Export

**Files:**
- Create: `src/lib/export.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/SettingsPanel.tsx`

- [ ] **Step 1: Implement export helpers**

Write `src/lib/export.ts`:

```ts
import { toPng } from "html-to-image";

export async function downloadNodeAsPng(node: HTMLElement, filename: string) {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 1,
    backgroundColor: "#ffffff",
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
```

- [ ] **Step 2: Wire export in `page.tsx`**

Maintain `pageRefs` and `isExporting`. `exportCurrent` downloads the selected page. `exportAll` loops through all refs and downloads sequential files named `xiaohongshu-page-N.png`. On failure, set a visible error string and re-enable controls.

- [ ] **Step 3: Add export status UI**

Show exporting state in `SettingsPanel` buttons. Disable export buttons while exporting.

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/export.ts src/app/page.tsx src/components/SettingsPanel.tsx
git commit -m "feat: export preview pages as png"
```

## Task 7: Final Verification and Vercel Readiness

**Files:**
- Create: `README.md`
- Modify: files only if verification finds issues.

- [ ] **Step 1: Add README**

Document local development and Vercel deployment:

```md
# 小红书 Markdown 排版工具

一个纯前端工具，把 Markdown 转成适合小红书发布的多页 PNG 图片。

## 功能

- Markdown 编辑和 `.md` 上传
- 自动分页和 `-------` 手动分割
- 多主题预览
- 自定义图片宽高
- 当前页或全部页面 PNG 导出

## 开发

\`\`\`bash
npm install
npm run dev
\`\`\`

## 验证

\`\`\`bash
npm test
npm run build
\`\`\`

## 部署

导入 Vercel 后使用默认 Next.js 配置即可部署。
```

- [ ] **Step 2: Run all automated tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Start dev server**

Run: `npm run dev`

Expected: local Next.js server starts, usually at `http://localhost:3000`.

- [ ] **Step 5: Browser verification**

Open the local URL and verify:

- Three-column layout is visible on desktop.
- Markdown edits update the preview.
- `-------` creates a hard page split.
- Long Markdown creates multiple pages.
- Theme tiles visibly change the preview.
- Width and height controls change output metadata and preview ratio.
- Export buttons trigger PNG downloads or show a retryable error.

- [ ] **Step 6: Commit final docs and fixes**

```bash
git add README.md src package.json package-lock.json
git commit -m "docs: add project usage instructions"
```

## Self-Review

- Spec coverage: the plan covers pure frontend Vercel deployment, three columns, Markdown upload, shortcuts, theme switching, custom dimensions, automatic pagination, `-------` manual split, PNG export, responsive layout, and verification.
- Placeholder scan: no unfinished placeholder markers or undefined deferred tasks remain.
- Type consistency: shared types are defined in Task 2 and reused by parsing, pagination, components, and export tasks.
