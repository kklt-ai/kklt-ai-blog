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
- Keep new or substantially edited code files near 600 lines or less so AI coding agents can read, reason about, and modify them safely in one pass. If a file approaches that size, split it by package and feature responsibility instead of adding more unrelated behavior.

## Project Summary

This is a Next.js App Router browser-first tool with two workspaces:

- `/` renders `src/md-image/MarkdownImageApp.tsx`, which turns Markdown into paginated PNG images suitable for Xiaohongshu posts.
- `/cover` renders `src/cover/components/CoverEditor.tsx`, which builds platform-specific cover images.

Key capabilities:

- Markdown editing and `.md` upload.
- Markdown toolbar actions for headings, emphasis, lists, quotes, code, highlights, tables, dividers, undo, and images.
- Manual page splitting with markdown dividers made of three or more dashes.
- Automatic pagination based on estimated rendered height.
- Theme, typography, dimension, watermark, and fixed-size controls.
- Local Markdown image upload stored in browser IndexedDB as `local-image://...` references.
- Markdown export through hidden full-size render nodes, with current-page PNG and all-page ZIP downloads.
- Cover editing with channel templates, text layers, brand icons, backgrounds, effects, snapping guides, multiple boards, custom templates, and independent PNG export.

## Commands

- `npm run dev` - start the Next.js dev server.
- `npm run build` - production build and type checking.
- `npm run lint` - run Next.js ESLint.
- `npm test` - run the Vitest suite once.
- `npm run test:watch` - run Vitest in watch mode.
- `npx vitest run path/to/file.test.ts` - run one test file.

Use `npm test` for most logic or component changes. Use `npm run build` when touching Next.js app wiring, API routes, exports, config, client/server rendering behavior, or anything that may affect production compilation.

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

Markdown image workspace:

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

Cover workspace:

- `src/cover/components/CoverEditor.tsx` - cover editor orchestration, shared state, canvas interactions, dialogs, and export wiring.
- `src/cover/components/CoverCanvas.tsx` - rendered cover layer content for preview and export.
- `src/cover/components/CoverPreviewPanel.tsx` - preview surface, export canvas, save/copy template actions, and board strip slot.
- `src/cover/components/CoverBoardStrip.tsx` - board thumbnails, board selection, add, delete, and limit message UI.
- `src/cover/components/CoverToolPanel.tsx` - template, text, image/logo, and background tools.
- `src/cover/components/CoverSettingsPanel.tsx` - selected layer settings and text style controls.
- `src/cover/components/CoverTopNav.tsx` - cover top navigation, channel switch, and export action.
- `src/cover/components/SaveTemplateDialog.tsx` - save-current-cover-as-template confirmation dialog.
- `src/cover/components/TemplateApplyDialog.tsx` - template application choice dialog for new board versus overwrite.
- `src/cover/components/TextEffectPicker.tsx` and `TextHighlightPicker.tsx` - text effect and highlight popovers.
- `src/cover/components/useCoverAssetLibrary.ts` - browser-saved custom templates/backgrounds and favorite ordering.
- `src/cover/components/useCoverBoards.ts` - board state, board persistence, template-to-board application, and board limit behavior.
- `src/cover/components/coverBoards.ts` - board model, storage key, cloning helpers, persistence helpers, and max board count.
- `src/cover/components/coverEditorTypes.ts` - component-level cover editor types.
- `src/cover/components/textEffectOptions.ts` and `textHighlightOptions.ts` - text style option definitions.
- `src/cover/lib/cover.ts` - public cover model barrel.
- `src/cover/lib/channels.ts` - platform dimensions and brand colors.
- `src/cover/lib/templates/` - cover template definitions and helpers.
- `src/cover/lib/backgroundImages/` - preset background image registries.
- `src/cover/lib/brandIcons.ts` - bundled brand icon registry.
- `src/cover/lib/layers.ts` - text/icon layer constructors and update helper.
- `src/cover/lib/selectors.ts` - template/background selectors and template cloning.
- `src/cover/lib/customTemplates.ts` - custom template creation, duplicate detection, storage, deletion, and exportable config text.
- `src/cover/lib/coverPreferences.ts` - custom background storage and favorite timestamp helpers.
- `src/cover/lib/snapping.ts` - preview canvas alignment guide calculations.
- `src/cover/lib/export.ts` - cover PNG download generation.
- `src/cover/lib/types.ts` - cover domain types.
- `src/cover/lib/fonts.ts` - cover font family mapping.

Tests are colocated beside source files with `.test.ts` or `.test.tsx` suffixes. `src/test/setup.ts` installs Vitest DOM matchers.

`docs/superpowers/` contains planning/spec artifacts. Do not edit it unless the request is about project planning docs.

## Data Flow

`MarkdownImageApp` owns the Markdown image app state:

1. Raw Markdown is parsed by `parseMarkdown()` into `MarkdownBlock[][]`.
2. Manual segments are split by a line containing three or more dashes.
3. Segments, dimensions, theme, fixed-size mode, and auto-pagination settings feed `paginateSegments()`.
4. `PreviewPanel` renders each page twice: scaled for preview and full-size in hidden export nodes.
5. Export actions call `downloadNodeAsPng()` or `downloadNodesAsZip()` from `src/md-image/lib/export.ts` on hidden full-size nodes.

Markdown image persistent browser state is stored under `localStorage` key `xhs-md-image-tool`. Dimension values are clamped to the supported range in `clampDimensions()`.

`CoverEditor` owns the cover editor shell state:

1. Channel selection chooses platform dimensions and templates from `src/cover/lib/cover.ts`.
2. `useCoverAssetLibrary()` loads browser-saved custom templates/backgrounds and favorite times after mount, then combines them with preset assets.
3. `useCoverBoards()` manages up to 10 boards, persists them under `localStorage` key `xhs-cover-boards`, and restores saved boards after mount.
4. Each board stores the channel id, active template id, selected background, and all cover layers.
5. Template selection opens `TemplateApplyDialog` so the user can either create a new board from the template or overwrite the current board.
6. Layer updates stay inside the active board's cover model and UI.
7. The interactive preview canvas is separate from the hidden full-size export node.
8. Export actions call `downloadCoverNodeAsPng()` from `src/cover/lib/export.ts`.

For cover browser persistence, avoid reading `localStorage` in initial render state when server-rendered output must match client hydration. Prefer deterministic initial UI, then restore browser-saved data in effects.

## Local Images

Uploaded Markdown images are saved in IndexedDB by `src/md-image/lib/localImages.ts`. The editor inserts short references like:

```md
![cover](local-image://cover-...)
```

The actual `data:image/...` payload stays in the browser. Markdown preview and export resolve those references through `loadLocalImageSources()` and `resolveImageSrc()`.

Do not replace this with inline base64 Markdown unless explicitly requested; that would make drafts much larger and bypass the current cleanup flow.

Cover custom backgrounds are stored separately in `localStorage` through `src/cover/lib/coverPreferences.ts`. Do not mix Markdown local image storage with cover background storage.

## Implementation Notes

- Keep `src/app/page.tsx` and `src/app/cover/page.tsx` as thin route wrappers.
- Keep Markdown image orchestration in `src/md-image/MarkdownImageApp.tsx`. Put Markdown parsing, pagination, dimensions, images, export, themes, typography, and watermark logic in `src/md-image/lib`.
- Keep cover orchestration in `src/cover/components/CoverEditor.tsx`, but keep feature-specific cover behavior in focused components/hooks such as `CoverToolPanel`, `CoverPreviewPanel`, `CoverBoardStrip`, `useCoverBoards`, and `useCoverAssetLibrary`.
- Put cover model helpers in `src/cover/lib/*` and cover export behavior in `src/cover/lib/export.ts`.
- Do not share export behavior between Markdown image generation and cover creation; each workspace owns its export module.
- Keep UI panels focused: editor behavior in `EditorPanel`, Markdown preview/export behavior in `PreviewPanel`, final Markdown page rendering in `RenderedPage`, Markdown settings in `SettingsPanel`, cover tools in `CoverToolPanel`, cover preview/export in `CoverPreviewPanel`, and cover settings in `CoverSettingsPanel`.
- When adding Markdown syntax, update parsing, rendering, pagination estimates, rendered-page CSS, toolbar behavior if applicable, and tests together.
- Tables are parsed from GFM into the custom `MarkdownBlock` AST, rendered by `RenderedPage`, estimated by `pagination.ts`, and styled in `globals.css` with theme syntax variables.
- When changing pagination or dimensions, cover both fixed-size and auto-height behavior where relevant.
- When changing image handling, account for remote URLs, local filesystem paths, standalone image lines, Markdown image syntax, and `local-image://` sources.
- When adding or changing a Markdown image theme, edit that theme's file in `src/md-image/lib/themes/`. Add new themes to `src/md-image/lib/themes/index.ts` to preserve the registry order, and update `src/md-image/lib/themes.test.ts` when the expected theme set or required syntax tokens changes.
- Shared Markdown image theme syntax tokens belong in `src/md-image/lib/themes/shared.ts`; avoid duplicating common token derivation in every theme file.
- When changing cover templates, backgrounds, icons, layers, board behavior, or custom template persistence, update the matching cover lib/component tests.
- Cover boards are capped at `MAX_COVER_BOARDS` in `src/cover/components/coverBoards.ts`. Keep the user-facing limit message and tests in sync if that cap changes.
- Use `lucide-react` icons for controls when an icon is needed.
- Avoid speculative abstractions and global rewrites.

## Testing Expectations

- Parser changes: add or update tests in `src/md-image/lib/markdown.test.ts`.
- Pagination changes: add or update tests in `src/md-image/lib/pagination.test.ts`.
- Markdown export changes: add or update tests in `src/md-image/lib/export.test.ts`.
- Cover model or export changes: add or update tests in `src/cover/lib/cover.test.ts`, `src/cover/lib/export.test.ts`, `src/cover/lib/customTemplates.test.ts`, `src/cover/lib/coverPreferences.test.ts`, or `src/cover/lib/snapping.test.ts`.
- Theme or typography changes: update relevant `src/md-image/lib/*test.ts` files.
- Rendered Markdown or syntax styling changes: update `src/md-image/components/RenderedPage.test.tsx`, `src/md-image/styles.test.ts`, and `src/app/globals.test.ts` where relevant.
- Local image changes: update `src/md-image/lib/localImages.test.ts` and component tests if editor or rendering behavior changes.
- Markdown component behavior changes: update the matching `src/md-image/components/*.test.tsx` file.
- Cover component behavior changes: update the matching `src/cover/components/*.test.tsx` file.
- Cover board changes: update `src/cover/components/CoverEditor.test.tsx` and, when persistence helpers change, add focused coverage around `src/cover/components/coverBoards.ts`.
- Cover custom template/background changes: update `src/cover/components/CoverEditor.customTemplates.test.tsx` and relevant cover lib tests.
- API route changes: update `src/app/api/image/route.test.ts`.

Before reporting completion, run the most relevant verification command and state what passed. If you cannot run a command, explain why.
