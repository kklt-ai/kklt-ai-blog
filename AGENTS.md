# AGENTS.md

Guidance for coding agents working in this repository.

## Working Rules

Follow the project-specific guidance in `CLAUDE.md`. In short:

- Think before changing code. State assumptions when the request is ambiguous.
- Prefer the smallest implementation that fully solves the requested task.
- Make surgical changes. Do not refactor, reformat, or clean up unrelated code.
- Match the existing style, naming, and component boundaries.
- Verify work with the narrowest meaningful tests, and broaden verification when the change touches shared behavior.
- Do not overwrite or revert user changes. Check `git status --short` before editing when unsure.

## Project Summary

This is a Next.js App Router web tool for turning Markdown into paginated PNG images suitable for Xiaohongshu posts. The app is a browser-first single page experience rooted at `src/app/page.tsx`.

Key capabilities:

- Markdown editing and `.md` upload.
- Markdown toolbar actions for headings, emphasis, lists, quotes, code, highlights, tables, dividers, undo, and images.
- Manual page splitting with markdown dividers made of three or more dashes.
- Automatic pagination based on estimated rendered height.
- Theme, typography, and dimension controls.
- Local image upload stored in browser IndexedDB as `local-image://...` references.
- PNG export through hidden full-size render nodes and `html-to-image`.

## Commands

- `npm run dev` - start the Next.js dev server.
- `npm run build` - production build.
- `npm run lint` - run Next.js ESLint.
- `npm test` - run the Vitest suite once.
- `npm run test:watch` - run Vitest in watch mode.
- `npx vitest run path/to/file.test.ts` - run one test file.

Use `npm test` for most logic or component changes. Use `npm run build` when touching Next.js app wiring, API routes, exports, config, or anything that may affect production compilation.

If `npm run lint` opens Next.js' interactive ESLint setup prompt, do not continue through that prompt unless explicitly asked to configure ESLint. Use the relevant Vitest command and `npm run build` as the verification path instead.

## Tech Stack

- Next.js 14.2, React 18, TypeScript.
- Tailwind CSS with global styles in `src/app/globals.css`.
- Vitest, jsdom, and `@testing-library/react`.
- `unified`, `remark-parse`, and `remark-gfm` for Markdown parsing.
- `html-to-image` for PNG export.
- `lucide-react` for UI icons.

## Repository Map

- `src/app/page.tsx` - client-side root page and global state orchestration.
- `src/app/layout.tsx` - app metadata and layout shell.
- `src/app/globals.css` - application, preview, and rendered-page styling.
- `src/app/api/image/route.ts` - image proxy/loader for remote and local filesystem image sources.
- `src/components/EditorPanel.tsx` - Markdown editor, formatting toolbar, `.md` upload, image upload, undo support.
- `src/components/PreviewPanel.tsx` - scaled previews, selected page state, export controls, hidden export DOM nodes, auto-height measurement.
- `src/components/RenderedPage.tsx` - theme-aware rendering of parsed Markdown blocks into the final page surface.
- `src/components/SettingsPanel.tsx` - image dimensions, fixed-size mode, auto-pagination, typography, and theme controls.
- `src/lib/markdown.ts` - Markdown parsing and conversion to the custom block/inline AST.
- `src/lib/pagination.ts` - page packing and oversized text/code splitting heuristics.
- `src/lib/dimensions.ts` - dimension clamping and page size resolution.
- `src/lib/themes/index.ts` - theme registry, default theme, lookup, and syntax-style resolution.
- `src/lib/themes/shared.ts` - shared theme helpers such as `syntax()`.
- `src/lib/themes/*.ts` - one static `ThemeDefinition` per theme.
- `src/lib/typography.ts` - font options, font-size presets, and typography resolution.
- `src/lib/images.ts` - image source resolution for rendered pages.
- `src/lib/localImages.ts` - IndexedDB-backed local image storage and cleanup helpers.
- `src/lib/export.ts` - PNG download generation.
- `src/lib/sample.ts` - default sample content and dimensions.
- `src/lib/types.ts` - shared domain types.
- `src/test/setup.ts` - Vitest DOM matcher setup.
- `docs/superpowers/` - planning/spec artifacts; do not edit unless the request is about project planning docs.

Tests are colocated beside source files with `.test.ts` or `.test.tsx` suffixes.

## Data Flow

The root page owns the app state:

1. Raw Markdown is parsed by `parseMarkdown()` into `MarkdownBlock[][]`.
2. Manual segments are split by a line containing three or more dashes.
3. Segments, dimensions, theme, fixed-size mode, and auto-pagination settings feed `paginateSegments()`.
4. `PreviewPanel` renders each page twice: scaled for preview and full-size in hidden export nodes.
5. Export actions call `downloadNodeAsPng()` on the hidden full-size node.

Persistent browser state is stored under `localStorage` key `xhs-md-image-tool`. Dimension values are clamped to the supported range in `clampDimensions()`.

## Local Images

Uploaded images are saved in IndexedDB by `src/lib/localImages.ts`. The editor inserts short references like:

```md
![cover](local-image://cover-...)
```

The actual `data:image/...` payload stays in the browser. Preview and export resolve those references through `loadLocalImageSources()` and `resolveImageSrc()`.

Do not replace this with inline base64 Markdown unless explicitly requested; that would make drafts much larger and bypass the current cleanup flow.

## Implementation Notes

- Keep `src/app/page.tsx` as the orchestration layer. Put parsing, pagination, dimensions, images, export, themes, and typography logic in `src/lib`.
- Keep UI panels focused: editor behavior in `EditorPanel`, preview/export behavior in `PreviewPanel`, final page rendering in `RenderedPage`, settings in `SettingsPanel`.
- When adding Markdown syntax, update parsing, rendering, pagination estimates, rendered-page CSS, toolbar behavior if applicable, and tests together.
- Tables are parsed from GFM into the custom `MarkdownBlock` AST, rendered by `RenderedPage`, estimated by `pagination.ts`, and styled in `globals.css` with theme syntax variables.
- When changing pagination or dimensions, cover both fixed-size and auto-height behavior where relevant.
- When changing image handling, account for remote URLs, local filesystem paths, standalone image lines, Markdown image syntax, and `local-image://` sources.
- When adding or changing a theme, edit that theme's file in `src/lib/themes/`. Add new themes to `src/lib/themes/index.ts` to preserve the registry order, and update `src/lib/themes.test.ts` when the expected theme set or required syntax tokens changes.
- Shared theme syntax tokens belong in `src/lib/themes/shared.ts`; avoid duplicating common token derivation in every theme file.
- Use `lucide-react` icons for controls when an icon is needed.
- Avoid speculative abstractions and global rewrites.

## Testing Expectations

- Parser changes: add or update tests in `src/lib/markdown.test.ts`.
- Pagination changes: add or update tests in `src/lib/pagination.test.ts`.
- Theme or typography changes: update relevant `src/lib/*test.ts` files.
- Rendered Markdown or syntax styling changes: update `src/components/RenderedPage.test.tsx` and `src/app/globals.test.ts` where relevant.
- Local image changes: update `src/lib/localImages.test.ts` and component tests if editor or rendering behavior changes.
- Component behavior changes: update the matching `src/components/*.test.tsx` file.
- API route changes: update `src/app/api/image/route.test.ts`.

Before reporting completion, run the most relevant verification command and state what passed. If you cannot run a command, explain why.
