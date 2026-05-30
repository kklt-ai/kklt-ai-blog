# Author Watermark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a configurable, small author watermark to every previewed and exported image.

**Architecture:** `page.tsx` owns persisted watermark state and passes it to settings, preview, and rendered page components. `RenderedPage` overlays the watermark on the final image surface so preview and export stay identical. `SettingsPanel` edits author name, visibility, and avatar data URL without changing Markdown body image storage.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Vitest, Testing Library, Tailwind/global CSS.

---

### Task 1: Shared Watermark Model

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/watermark.ts`

- [ ] **Step 1: Write the shared type**

Add this to `src/lib/types.ts`:

```ts
export type WatermarkSettings = {
  enabled: boolean;
  authorName: string;
  avatarSrc: string | null;
};
```

- [ ] **Step 2: Create default settings**

Create `src/lib/watermark.ts`:

```ts
import type { WatermarkSettings } from "./types";

export const DEFAULT_WATERMARK_AUTHOR_NAME = "卡卡罗特AI";
export const DEFAULT_WATERMARK_AVATAR_SRC = "/watermark-avatar.jpg";

export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
  enabled: true,
  authorName: DEFAULT_WATERMARK_AUTHOR_NAME,
  avatarSrc: DEFAULT_WATERMARK_AVATAR_SRC,
};

export function normalizeWatermarkSettings(value: unknown): WatermarkSettings {
  if (!value || typeof value !== "object") return DEFAULT_WATERMARK_SETTINGS;

  const record = value as Partial<WatermarkSettings>;

  return {
    enabled:
      typeof record.enabled === "boolean"
        ? record.enabled
        : DEFAULT_WATERMARK_SETTINGS.enabled,
    authorName:
      typeof record.authorName === "string"
        ? record.authorName
        : DEFAULT_WATERMARK_SETTINGS.authorName,
    avatarSrc:
      typeof record.avatarSrc === "string" || record.avatarSrc === null
        ? record.avatarSrc
        : DEFAULT_WATERMARK_SETTINGS.avatarSrc,
  };
}
```

### Task 2: Render Watermark

**Files:**
- Modify: `src/components/RenderedPage.test.tsx`
- Modify: `src/components/RenderedPage.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write failing render tests**

Add tests to `RenderedPage.test.tsx` that assert:

```tsx
expect(screen.getByText("卡卡罗特AI").closest(".xhs-watermark")).not.toBeNull();
expect(screen.getByRole("img", { name: "作者头像" })).toHaveAttribute(
  "src",
  "/watermark-avatar.jpg",
);
```

Also assert name-only rendering when `avatarSrc: null`, and no `.xhs-watermark` when `enabled: false`.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
npx vitest run src/components/RenderedPage.test.tsx
```

Expected: FAIL because `RenderedPage` does not accept or render `watermark`.

- [ ] **Step 3: Implement rendering**

Add `watermark?: WatermarkSettings` to `RenderedPageProps`, render an absolutely positioned:

```tsx
{shouldRenderWatermark ? (
  <div className="xhs-watermark" aria-label="作者水印">
    {watermark.avatarSrc ? (
      <img className="xhs-watermark-avatar" alt="作者头像" src={watermark.avatarSrc} />
    ) : null}
    {trimmedAuthorName ? (
      <span className="xhs-watermark-name">{trimmedAuthorName}</span>
    ) : null}
  </div>
) : null}
```

Use `watermark?.enabled`, trimmed author name, and avatar presence to decide visibility.

- [ ] **Step 4: Add CSS**

Add compact `.xhs-watermark`, `.xhs-watermark-avatar`, and `.xhs-watermark-name` rules near existing `.xhs-page` CSS. Keep the watermark high z-index, small, capped width, and non-interactive.

- [ ] **Step 5: Run render tests and confirm pass**

Run:

```bash
npx vitest run src/components/RenderedPage.test.tsx
```

Expected: PASS.

### Task 3: Settings Panel Controls

**Files:**
- Modify: `src/components/SettingsPanel.test.tsx`
- Modify: `src/components/SettingsPanel.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write failing settings tests**

Add tests that render `SettingsPanel` with:

```ts
watermark={{
  enabled: true,
  authorName: "卡卡罗特AI",
  avatarSrc: "/watermark-avatar.jpg",
}}
onWatermarkChange={onWatermarkChange}
onWatermarkUploadError={onWatermarkUploadError}
```

Assert:

- clicking `显示水印` calls `onWatermarkChange` with `enabled: false`,
- changing `作者名` calls `onWatermarkChange` with the new name,
- clicking `移除头像` calls `onWatermarkChange` with `avatarSrc: null`,
- uploading an image calls `onWatermarkChange` with a data URL.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
npx vitest run src/components/SettingsPanel.test.tsx
```

Expected: FAIL because watermark props and controls do not exist.

- [ ] **Step 3: Implement controls**

Add these props to `SettingsPanelProps`:

```ts
watermark: WatermarkSettings;
onWatermarkChange: (watermark: WatermarkSettings) => void;
onWatermarkUploadError: (message: string) => void;
```

Add an `作者水印` section after typography and before theme selection. Use a hidden file input for avatar uploads, an image preview when `avatarSrc` exists, a remove button, a switch, and an author-name text input.

- [ ] **Step 4: Add settings CSS**

Add compact classes for avatar row, preview circle, and watermark buttons. Reuse existing border, switch, input, and button visual language.

- [ ] **Step 5: Run settings tests and confirm pass**

Run:

```bash
npx vitest run src/components/SettingsPanel.test.tsx
```

Expected: PASS.

### Task 4: Wire State and Preview/Export

**Files:**
- Modify: `src/components/PreviewPanel.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/PreviewPanel.test.tsx` only if TypeScript requires new props in test renders

- [ ] **Step 1: Pass watermark through PreviewPanel**

Add `watermark: WatermarkSettings` to `PreviewPanelProps` and pass it to both scaled and hidden `RenderedPage` instances.

- [ ] **Step 2: Persist watermark in page state**

In `src/app/page.tsx`:

```ts
const [watermark, setWatermark] = useState(DEFAULT_WATERMARK_SETTINGS);
```

Add `watermark?: WatermarkSettings` to `StoredState`, restore with `normalizeWatermarkSettings(parsed.watermark)`, and save `watermark` in every localStorage write path.

- [ ] **Step 3: Connect settings**

Pass `watermark`, `onWatermarkChange={setWatermark}`, and `onWatermarkUploadError={setMessage}` to `SettingsPanel`.

- [ ] **Step 4: Run type-focused tests**

Run:

```bash
npx vitest run src/components/RenderedPage.test.tsx src/components/SettingsPanel.test.tsx src/components/PreviewPanel.test.tsx
```

Expected: PASS.

### Task 5: Default Avatar Asset

**Files:**
- Create: `public/watermark-avatar.jpg`

- [ ] **Step 1: Create public directory**

Run:

```bash
mkdir -p public
```

- [ ] **Step 2: Copy provided avatar**

Run:

```bash
cp "/Users/hecheng/Desktop/与梦/微信/头像.JPG" public/watermark-avatar.jpg
```

- [ ] **Step 3: Verify asset exists**

Run:

```bash
ls -l public/watermark-avatar.jpg
```

Expected: file exists and is non-empty.

### Task 6: Final Verification

**Files:**
- No code edits unless verification exposes a real issue.

- [ ] **Step 1: Run focused tests**

Run:

```bash
npx vitest run src/components/RenderedPage.test.tsx src/components/SettingsPanel.test.tsx src/components/PreviewPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run app verification**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Inspect git diff**

Run:

```bash
git diff -- src/lib/types.ts src/lib/watermark.ts src/components/RenderedPage.tsx src/components/SettingsPanel.tsx src/components/PreviewPanel.tsx src/app/page.tsx src/app/globals.css
```

Expected: only watermark-related changes.

