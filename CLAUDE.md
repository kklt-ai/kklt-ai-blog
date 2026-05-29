# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Behavioral Guidelines (from Andrej Karpathy Skills)

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

---

## Project Overview

A Next.js (App Router) web tool that converts Markdown into paginated PNG images styled for Xiaohongshu (小红书) posts. It is a pure frontend SPA contained in a single page (`src/app/page.tsx`).

## Development Commands

- `npm run dev` — Start the Next.js dev server.
- `npm run build` — Production build.
- `npm run lint` — Run ESLint with Next.js config.
- `npm test` — Run all Vitest tests once.
- `npm run test:watch` — Run Vitest in watch mode.
- To run a single test file: `npx vitest run src/lib/markdown.test.ts` (or any specific path).

## Tech Stack

- Next.js 14.2 + React 18 (client components only) + TypeScript
- Tailwind CSS (custom extensions in `tailwind.config.ts`)
- Vitest + jsdom + `@testing-library/react` for testing (`vitest.config.ts`)
- `html-to-image` for PNG export
- `unified` / `remark-parse` / `remark-gfm` for Markdown parsing

## High-Level Architecture

### State & Data Flow

The root page (`src/app/page.tsx`) is a client component that holds all global state:

1. **Raw Markdown** (`markdown`) → `parseMarkdown()` → `MarkdownBlock[][]`
   - `parseMarkdown` splits the input on `\n-------\n` into manual segments, then parses each segment via `remark-parse` + `remark-gfm` into a custom `MarkdownBlock` AST.
2. **Segments** + **Dimensions/Theme/AutoPaginate** → `paginateSegments()` → `GeneratedPage[]`
   - `paginateSegments` estimates each block’s rendered height using heuristics (chars per line based on `baseFontSize` and `contentWidth`).
   - When `autoPaginate` is true, oversized text blocks are split, and blocks are packed into pages that fit within `dimensions.height - theme.padding * 2`.
   - When `autoPaginate` is false, each manual segment becomes exactly one page (no overflow splitting).
3. **Pages** → rendered by `PreviewPanel` (scaled preview + hidden full-scale DOM nodes for export).

### Export Pipeline

`PreviewPanel` renders every `GeneratedPage` twice:
- Once inside `.preview-frame` at a downscaled size for the UI preview.
- Once inside `.export-pages` (visually hidden) at full scale. `pageRefs` captures these hidden DOM nodes.

`export.ts` uses `html-to-image`'s `toPng()` on the captured hidden node to generate the PNG download.

### Themes

Themes are defined in `src/lib/themes.ts` as static data (`ThemeDefinition`). Each theme specifies colors, font family, spacing, border radius, and a `motif` (background pattern). `RenderedPage` applies the active theme via CSS custom properties mapped from the theme object.

### File Upload

`EditorPanel` accepts `.md` files via a hidden file input. It reads the file with `FileReader` and replaces the editor content.

### Keyboard Shortcuts

Defined in `page.tsx`:
- `Cmd/Ctrl + S` — Persist current state to `localStorage` under key `xhs-md-image-tool`.
- `Cmd/Ctrl + Enter` — Export the currently selected page.

### Persistent State

State (markdown, themeId, dimensions, autoPaginate) is automatically saved to `localStorage` on every change and restored on mount. `clampDimensions` enforces a 600–2400px range.

## Testing

Tests are co-located with source files (e.g., `src/lib/markdown.test.ts`). The test setup imports `@testing-library/jest-dom/vitest` from `src/test/setup.ts`. Component tests use `@testing-library/react` with jsdom.
