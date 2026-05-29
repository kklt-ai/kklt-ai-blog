# Xiaohongshu Markdown Image Tool Design

## Summary

Build a pure frontend Xiaohongshu layout tool that converts Markdown into one or more exportable images. The first version is a three-column creative workspace:

- Left: Markdown editing panel with keyboard shortcuts and `.md` upload.
- Center: Xiaohongshu image preview with multiple generated pages.
- Right: settings for themes, image dimensions, pagination, and export.

The app will be deployable directly to Vercel and will not require login, a database, or server-side rendering for image generation.

## Goals

- Convert Markdown into styled Xiaohongshu-ready PNG images.
- Provide a polished three-column editor, preview, and settings workflow.
- Include a large built-in theme set, starting with Japanese minimalist, iPhone Notes, punk, Memphis, and pop art styles.
- Allow users to customize output width and height.
- Automatically paginate long content so text is not cut off.
- Treat a standalone `-------` line as a manual image/page split.
- Support `.md` file upload and useful keyboard shortcuts.
- Keep the project simple to deploy on Vercel.

## Non-Goals

- User accounts, cloud drafts, team collaboration, or server-side storage.
- A full drag-and-drop design editor with arbitrary layers.
- Server-rendered image generation.
- Complex image editing beyond Markdown-to-layout rendering.

## Product Direction

The selected visual direction is a strong, expressive creative workstation rather than a quiet form tool. The interface should feel energetic and content-creator-friendly, with bold borders, punchy accents, clear controls, and visible theme personality. The workspace still needs to remain usable for long editing sessions, so the expressive styling should frame the tool without making Markdown editing or settings hard to scan.

The first screen is the actual working app, not a landing page.

## Architecture

Use `Next.js` with the App Router for a client-first single-page application. The app is static-friendly and deploys to Vercel without custom backend services.

Core modules:

- `EditorPanel`: Markdown textarea/editor, shortcut handling, `.md` upload, and sample content reset.
- `PreviewPanel`: paginated image canvas preview, page navigation, and current output metadata.
- `SettingsPanel`: theme selection, width and height controls, pagination controls, and export actions.
- `markdown` utilities: split raw Markdown, parse content blocks, and normalize content.
- `pagination` utilities: convert parsed blocks into pages based on the selected output size and theme metrics.
- `themes` configuration: data-driven theme definitions for colors, typography, spacing, borders, decorations, and block treatments.
- `export` utilities: convert rendered preview DOM nodes to PNG files for current-page and all-page export.

State is held at the page/workspace level:

- raw Markdown
- selected theme id
- output width and height
- pagination options
- selected preview page
- generated pages
- export status and user-facing errors

Derived state, such as parsed blocks and generated pages, is recomputed when Markdown, theme, dimensions, or pagination settings change.

## Data Flow

1. User types Markdown or uploads a `.md` file.
2. The app stores raw Markdown in editor state.
3. The Markdown is split by standalone `-------` lines. Each split segment is a manual page group.
4. Each segment is parsed into structured Markdown blocks, such as headings, paragraphs, lists, quotes, code blocks, and image placeholders.
5. The pagination layer receives blocks, selected theme metrics, and output dimensions.
6. Automatic pagination runs inside each manual segment and never merges content across a manual `-------` boundary.
7. The preview panel renders the resulting `pages[]` as fixed-ratio Xiaohongshu canvases.
8. Export captures each rendered page DOM node and downloads PNG files.

Rules:

- `-------` is always a hard page boundary.
- Automatic pagination only happens inside a manual segment.
- Very long paragraphs or code blocks are split at line or text-run boundaries when needed.
- Width, height, theme, and Markdown changes trigger pagination recalculation.
- The selected page is clamped to the current valid page range after recalculation.

## Markdown Support

The first version should support:

- `#`, `##`, and `###` headings
- paragraphs
- bold and italic inline text
- unordered and ordered lists
- blockquotes
- fenced code blocks
- horizontal manual page split using a standalone `-------` line
- image syntax rendered as a styled placeholder or browser-loadable image when the URL is usable from the client

Markdown parsing should use a proven parser instead of ad hoc regex-only parsing.

## Theme System

Themes are defined as structured configuration objects. Each theme should include:

- id, name, description
- background, foreground, accent, muted, border colors
- font family choices
- base font sizes and line heights
- canvas padding
- block spacing
- heading, paragraph, list, quote, and code styles
- optional decorative motifs implemented in CSS

Initial themes:

- Japanese minimalist
- iPhone Notes
- punk
- Memphis
- pop art
- clean editorial
- soft magazine
- high-contrast poster

The settings panel should make theme switching feel immediate and visual, using swatches or compact preview tiles rather than only text labels.

## Layout

Desktop layout:

- Three-column workspace fills the viewport.
- Left editor column is optimized for writing and upload actions.
- Center preview column prioritizes the rendered Xiaohongshu pages and page navigation.
- Right settings column contains grouped controls for theme, dimensions, pagination, and export.

Responsive behavior:

- On narrower screens, columns become stacked or tabbed panels.
- Preview remains accessible and exportable on small screens.
- Controls must not overlap or overflow their containers.

## Editing Features

The editor panel includes:

- Markdown input area.
- Upload button for `.md` files.
- Basic shortcut hints.
- Keyboard shortcuts:
  - `Cmd/Ctrl + S`: prevent browser save and keep current draft in local state or local storage.
  - `Cmd/Ctrl + Enter`: export current page or all pages, depending on the active export mode.
- Empty-state sample Markdown so the preview is never blank.

Local storage may be used for the latest draft and user settings, but it is not a cloud sync feature.

## Preview and Pagination

The preview panel includes:

- Current page preview.
- Adjacent page thumbnails or page navigation.
- Page count display.
- Output size display.
- Visible overflow/error indicator if pagination cannot split a content block cleanly.

Automatic pagination should prefer readable results over forcing everything into one image. It should create additional images when content exceeds the selected canvas height.

## Settings

The settings panel includes:

- Theme selector with visual theme tiles.
- Width and height numeric inputs.
- Preset sizes, including a Xiaohongshu-friendly default of `1080 x 1440`.
- Pagination toggle for automatic pagination.
- Manual split instruction showing `-------`.
- Export current page.
- Export all pages.

Dimension inputs are clamped to a reasonable range:

- minimum width/height: `600`
- maximum width/height: `2400`

## Export

Export runs in the browser:

- Capture the preview page DOM into PNG.
- Export current page as one PNG.
- Export all pages as sequential PNG files, such as `xiaohongshu-page-1.png`.
- While export is running, disable export buttons and show progress/status.
- On export failure, show a retryable error without losing editor content.

If zip export is simple to add without making the first version heavy, it can be included. Otherwise sequential downloads are acceptable for the first version.

## Error Handling

- Empty Markdown shows sample content and a useful preview.
- Non-`.md` uploads show a friendly error and do not overwrite current content.
- Failed file reads show an error and keep the current content.
- Invalid dimensions are clamped.
- Export failures show an error and re-enable controls.
- Theme changes that reduce page count clamp the selected page.
- Repeated export clicks are ignored while export is already running.

## Testing and Verification

Automated tests:

- Manual split detection for standalone `-------`.
- Markdown block parsing for supported block types.
- Pagination behavior for long content and hard split boundaries.
- Dimension clamping.
- Theme lookup and default fallback.

Component and interaction tests:

- `.md` upload updates the editor.
- Non-`.md` upload is rejected without content loss.
- Theme selection changes preview styling.
- Width and height controls update the preview size.
- Page navigation remains valid after content/theme/size changes.

Manual verification:

- Desktop three-column layout is usable.
- Narrow/mobile layout is still usable.
- Built-in themes are visually distinct.
- Long Markdown automatically becomes multiple pages.
- `-------` forces page splits.
- PNG export creates readable images.
- `npm run build` passes for Vercel deployment.

## Implementation Notes

Prefer established libraries for Markdown parsing and DOM-to-PNG export. Keep theme and pagination logic independent from React components where practical, so they can be unit tested directly.

The first version should favor a reliable browser-only workflow over cloud features. The architecture should leave room for future additions such as saved templates, image uploads, zip export, and share links, but those are not part of the first release.
