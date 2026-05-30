# Author Watermark Design

## Goal

Add a small author watermark to the top-right corner of every generated image. The watermark supports an optional avatar plus an author name, defaults to the provided avatar and the author name `卡卡罗特AI`, and is editable from the settings panel.

## User Experience

- Watermark is enabled by default so exported images carry attribution immediately.
- Settings panel includes a compact `作者水印` section with:
  - a `显示水印` switch,
  - an author name text input,
  - an avatar upload control,
  - a remove-avatar action.
- If avatar and author name are both present, the watermark shows both.
- If no avatar is configured, it shows only the author name.
- If the author name is empty but an avatar exists, it shows only the avatar.
- If the switch is off, or both avatar and author name are empty, no watermark is rendered.
- The watermark is intentionally small and visually quiet: a light pill in the page's top-right corner with a circular avatar and compact text.

## Architecture

Add a `WatermarkSettings` type to shared types:

- `enabled: boolean`
- `authorName: string`
- `avatarSrc: string | null`

Add default constants in a small `src/lib/watermark.ts` module:

- `DEFAULT_WATERMARK_AUTHOR_NAME = "卡卡罗特AI"`
- `DEFAULT_WATERMARK_AVATAR_SRC = "/watermark-avatar.jpg"`
- `DEFAULT_WATERMARK_SETTINGS`

Store the provided avatar as a static public asset so the default works before any user upload. The current project has no `public/` directory, so the feature will create one and place the asset there.

## Data Flow

`src/app/page.tsx` owns watermark state alongside the existing theme, dimensions, and typography settings. It restores the watermark from `localStorage`, saves it with the existing draft payload, and passes it into:

- `SettingsPanel`, for editing.
- `PreviewPanel`, for both scaled preview and hidden export render nodes.
- `RenderedPage`, where the watermark is drawn on the final page surface.

Avatar uploads in settings use `FileReader.readAsDataURL()` and store the uploaded image data URL in localStorage. This is acceptable for the author avatar because it is one small profile image, separate from Markdown body images that already use IndexedDB.

## Rendering

`RenderedPage` renders the watermark as an absolutely positioned overlay inside `.xhs-page`, after theme chrome and before/alongside page content. It uses a higher z-index than motif backgrounds and content so it remains visible. The watermark is not part of pagination measurement because it is positioned outside normal flow.

The CSS should:

- anchor it to `top: calc(var(--page-padding) * 0.55)` and `right: calc(var(--page-padding) * 0.55)`,
- cap width so long names do not cover the page,
- use `font-size: max(12px, calc(var(--page-base) * 0.28))`,
- use a circular avatar around `34px`,
- apply subtle opacity and a light pill background.

For the `iphone-notes` theme, the watermark still sits at the top right of the exported page and may overlay the notes chrome if the user leaves it enabled. This is acceptable because the setting can be turned off and the watermark's purpose is brand attribution.

## Error Handling

- Invalid or missing stored watermark values fall back to defaults.
- Failed avatar reads show the existing inline message mechanism in the editor panel area via `setMessage`.
- Upload input accepts images only.

## Testing

Use TDD for implementation.

- `RenderedPage.test.tsx`
  - renders avatar plus author name when enabled,
  - renders author name alone when no avatar is set,
  - omits watermark when disabled.
- `SettingsPanel.test.tsx`
  - changes author name,
  - toggles watermark visibility,
  - removes avatar,
  - accepts an uploaded avatar and calls the settings change handler with a data URL.
- A focused app-level test is not required unless state restoration or persistence becomes too coupled to verify through component tests.

Run the most relevant verification command after implementation, likely:

```bash
npx vitest run src/components/RenderedPage.test.tsx src/components/SettingsPanel.test.tsx
```

