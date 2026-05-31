# Cover Editor Design

## Goal

Add an isolated cover-making workspace for Xiaohongshu and WeChat public-account covers. The workspace should feel like a lightweight, template-first design tool: choose a built-in cover, edit text directly through controls, drag text into position, add brand icons, and export a PNG.

## Product Positioning

The first version is a practical MVP, not a full Figma/稿定设计 clone. It optimizes for the user's repeated workflow:

1. Pick a prebuilt visual cover.
2. Replace the text.
3. Drag text blocks into a pleasing composition.
4. Adjust typography quickly.
5. Add relevant AI/tool brand icons.
6. Export the finished cover.

This keeps the feature useful immediately while leaving room for future professional features like multi-select, snapping guides, uploads, history, and layer locking.

## Information Architecture

The feature lives at `/cover`. The existing Markdown image tool remains the home page and only gets a navigation button to open the cover tool. Cover editor state, templates, icons, and controls are separate from Markdown parsing, pagination, local image storage, and rendered-page themes.

## Page Layout

Use a three-panel creator layout:

- Left panel: cover size switcher, template gallery, icon library, and add-text action.
- Center panel: large editing canvas with selected layer handles and direct drag interaction.
- Right panel: selected-layer inspector for content, font, size, color, bold, italic, underline, alignment, and layer deletion.

The page should look polished and productized: bright creator-tool framing, clear section labels, high-contrast buttons, empty-state guidance, and responsive stacking on narrow screens.

## Cover Formats

Support two initial formats:

- Xiaohongshu cover: 1242 × 1660.
- WeChat article cover: 1200 × 628.

Changing format updates the canvas size and template set. The editor uses a scaled on-screen canvas but stores positions as percentages so templates remain understandable and future resizing is easier.

## Templates

Templates are static data objects, intentionally easy to extend later. Each template contains:

- id, name, channel, description,
- dimensions,
- Tailwind-friendly background style data,
- default text layers,
- optional default icon layers.

The MVP can use CSS gradient/photo-like backgrounds instead of real bundled image assets. This keeps the implementation self-contained while preserving the product structure for future built-in image covers.

## Layers

Two layer types are required:

- Text layer: editable content, x/y/width in percentages, font size, color, font family, weight, italic, underline, alignment, and optional letter spacing.
- Icon layer: brand icon id, x/y/size in percentages, optional label, and color style.

Text layers are draggable on the canvas. Icon layers are addable from the library and selectable. The MVP may keep icon dragging if it falls out naturally from the shared drag handler; otherwise text dragging is the critical requirement.

## Typography Controls

The inspector supports:

- text content,
- font size,
- color,
- font family,
- bold,
- italic,
- underline,
- text alignment.

Use common Chinese/social-post font stacks already available in the browser. Controls should update the selected layer immediately.

## Icon Library

Provide built-in brand-like icons for:

- Codex,
- OpenAI,
- Anthropic,
- ChatGPT,
- Claude,
- Gemini.

To avoid external asset coupling, represent icons as clean inline SVG/lettermark badges in the first version. The data shape should allow replacing them with official SVG assets later.

## Export

Export the current canvas as PNG using the existing `downloadNodeAsPng()` utility. The exported node should be the canvas itself at rendered size. The filename should include the format and date-friendly prefix, for example `cover-xiaohongshu.png`.

## Styling Boundary

Do not add component-specific cover editor styles to `src/app/globals.css`. Use Tailwind classes inside cover editor components. Only rely on existing global base styles and Tailwind utilities.

## Testing Strategy

Add focused tests for data and interaction-heavy logic:

- Template registry returns templates for both supported channels.
- Creating a text layer produces sensible default typography.
- Updating a selected text layer changes only that layer.
- Canvas renders a selected template, exposes template buttons, allows adding text and icons, and exposes inspector controls.

Run the most relevant test file first, then `npm test`, and use `npm run build` because a new App Router page is added.

## Out of Scope for MVP

- User-uploaded backgrounds.
- Multi-page cover projects.
- Snapping guides and ruler grid.
- Undo/redo history.
- Multi-select.
- Layer locking.
- Persistent draft storage.
- Official brand SVG licensing review.
