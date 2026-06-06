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

This is a Next.js App Router browser-first tool with two workspaces:

- `/` renders `src/md-image/MarkdownImageApp.tsx`, which turns Markdown into paginated PNG images suitable for Xiaohongshu posts.
- `/cover` renders `src/cover/components/CoverEditor.tsx`, which builds platform-specific cover images.

Key capabilities:

- Markdown editing and `.md` upload.
- Markdown toolbar actions for headings, emphasis, lists, quotes, code, highlights, tables, dividers, undo, and images.
- Manual page splitting with markdown dividers made of three or more dashes.
- Automatic pagination based on estimated rendered height.
- Theme, typography, and dimension controls.
- Local image upload stored in browser IndexedDB as `local-image://...` references.
- Markdown export through hidden full-size render nodes, with current-page PNG and all-page ZIP downloads.
- Cover editing with channel templates, text layers, brand icons, and independent PNG export.

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

- `src/app/page.tsx` - root route that renders the Markdown image workspace.
- `src/app/cover/page.tsx` - cover route that renders the cover workspace.
- `src/app/layout.tsx` - app metadata and layout shell.
- `src/app/globals.css` - application, preview, and rendered-page styling.
- `src/app/api/image/route.ts` - image proxy/loader for remote and local filesystem image sources.
- `src/md-image/MarkdownImageApp.tsx` - Markdown image workspace state orchestration.
- `src/md-image/components/EditorPanel.tsx` - Markdown editor, formatting toolbar, `.md` upload, image upload, undo support.
- `src/md-image/components/PreviewPanel.tsx` - scaled previews, selected page state, export controls, hidden export DOM nodes, auto-height measurement.
- `src/md-image/components/RenderedPage.tsx` - theme-aware rendering of parsed Markdown blocks into the final page surface.
- `src/md-image/components/SettingsPanel.tsx` - image dimensions, fixed-size mode, auto-pagination, typography, watermark, and theme controls.
- `src/md-image/lib/markdown.ts` - Markdown parsing and conversion to the custom block/inline AST.
- `src/md-image/lib/pagination.ts` - page packing and oversized text/code splitting heuristics.
- `src/md-image/lib/dimensions.ts` - dimension clamping and page size resolution.
- `src/md-image/lib/themes/index.ts` - theme registry, default theme, lookup, and syntax-style resolution.
- `src/md-image/lib/themes/shared.ts` - shared theme helpers such as `syntax()`.
- `src/md-image/lib/themes/*.ts` - one static `ThemeDefinition` per theme.
- `src/md-image/lib/typography.ts` - font options, font-size presets, and typography resolution.
- `src/md-image/lib/images.ts` - image source resolution for rendered pages.
- `src/md-image/lib/localImages.ts` - IndexedDB-backed local image storage and cleanup helpers.
- `src/md-image/lib/export.ts` - Markdown image PNG and ZIP download generation.
- `src/md-image/lib/sample.ts` - default sample content and dimensions.
- `src/md-image/lib/types.ts` - Markdown image shared domain types.
- `src/md-image/lib/watermark.ts` - default watermark settings and normalization.
- `src/md-image/styles.css` - Markdown image workspace, preview, and rendered-page styling.
- `src/cover/components/CoverEditor.tsx` - cover editor UI, canvas interactions, hidden export node, and local state.
- `src/cover/lib/cover.ts` - cover channels, templates, layers, icons, and model helpers.
- `src/cover/lib/export.ts` - cover PNG download generation.
- `src/test/setup.ts` - Vitest DOM matcher setup.
- `docs/superpowers/` - planning/spec artifacts; do not edit unless the request is about project planning docs.

Tests are colocated beside source files with `.test.ts` or `.test.tsx` suffixes.

## Data Flow

`MarkdownImageApp` owns the Markdown image app state:

1. Raw Markdown is parsed by `parseMarkdown()` into `MarkdownBlock[][]`.
2. Manual segments are split by a line containing three or more dashes.
3. Segments, dimensions, theme, fixed-size mode, and auto-pagination settings feed `paginateSegments()`.
4. `PreviewPanel` renders each page twice: scaled for preview and full-size in hidden export nodes.
5. Export actions call `downloadNodeAsPng()` or `downloadNodesAsZip()` from `src/md-image/lib/export.ts` on hidden full-size nodes.

Persistent browser state is stored under `localStorage` key `xhs-md-image-tool`. Dimension values are clamped to the supported range in `clampDimensions()`.

`CoverEditor` owns the cover editor state:

1. Channel selection chooses platform dimensions and templates from `src/cover/lib/cover.ts`.
2. Layer updates stay inside the cover editor model and UI.
3. The interactive preview canvas is separate from the hidden full-size export node.
4. Export actions call `downloadCoverNodeAsPng()` from `src/cover/lib/export.ts`.

## Local Images

Uploaded Markdown images are saved in IndexedDB by `src/md-image/lib/localImages.ts`. The editor inserts short references like:

```md
![cover](local-image://cover-...)
```

The actual `data:image/...` payload stays in the browser. Markdown preview and export resolve those references through `loadLocalImageSources()` and `resolveImageSrc()`.

Do not replace this with inline base64 Markdown unless explicitly requested; that would make drafts much larger and bypass the current cleanup flow.

## Implementation Notes

- Keep `src/app/page.tsx` and `src/app/cover/page.tsx` as thin route wrappers.
- Keep Markdown image orchestration in `src/md-image/MarkdownImageApp.tsx`. Put Markdown parsing, pagination, dimensions, images, export, themes, typography, and watermark logic in `src/md-image/lib`.
- Keep cover editing behavior in `src/cover/components/CoverEditor.tsx`. Put cover model helpers in `src/cover/lib/cover.ts` and cover export behavior in `src/cover/lib/export.ts`.
- Do not share export behavior between Markdown image generation and cover creation; each workspace owns its export module.
- Keep UI panels focused: editor behavior in `EditorPanel`, preview/export behavior in `PreviewPanel`, final page rendering in `RenderedPage`, settings in `SettingsPanel`.
- When adding Markdown syntax, update parsing, rendering, pagination estimates, rendered-page CSS, toolbar behavior if applicable, and tests together.
- Tables are parsed from GFM into the custom `MarkdownBlock` AST, rendered by `RenderedPage`, estimated by `pagination.ts`, and styled in `globals.css` with theme syntax variables.
- When changing pagination or dimensions, cover both fixed-size and auto-height behavior where relevant.
- When changing image handling, account for remote URLs, local filesystem paths, standalone image lines, Markdown image syntax, and `local-image://` sources.
- When adding or changing a Markdown image theme, edit that theme's file in `src/md-image/lib/themes/`. Add new themes to `src/md-image/lib/themes/index.ts` to preserve the registry order, and update `src/md-image/lib/themes.test.ts` when the expected theme set or required syntax tokens changes.
- Shared Markdown image theme syntax tokens belong in `src/md-image/lib/themes/shared.ts`; avoid duplicating common token derivation in every theme file.
- Use `lucide-react` icons for controls when an icon is needed.
- Avoid speculative abstractions and global rewrites.

## Testing Expectations

- Parser changes: add or update tests in `src/md-image/lib/markdown.test.ts`.
- Pagination changes: add or update tests in `src/md-image/lib/pagination.test.ts`.
- Markdown export changes: add or update tests in `src/md-image/lib/export.test.ts`.
- Cover model or export changes: add or update tests in `src/cover/lib/cover.test.ts` or `src/cover/lib/export.test.ts`.
- Theme or typography changes: update relevant `src/md-image/lib/*test.ts` files.
- Rendered Markdown or syntax styling changes: update `src/md-image/components/RenderedPage.test.tsx`, `src/md-image/styles.test.ts`, and `src/app/globals.test.ts` where relevant.
- Local image changes: update `src/md-image/lib/localImages.test.ts` and component tests if editor or rendering behavior changes.
- Component behavior changes: update the matching `src/md-image/components/*.test.tsx` or `src/cover/components/*.test.tsx` file.
- API route changes: update `src/app/api/image/route.test.ts`.

Before reporting completion, run the most relevant verification command and state what passed. If you cannot run a command, explain why.
