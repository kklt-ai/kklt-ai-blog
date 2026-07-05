# Markdown Image Fit Setting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Markdown images display completely within the existing 460px height limit by default, with an optional persisted setting that restores cropped cover behavior.

**Architecture:** `MarkdownImageApp` owns a persisted `cropImages` boolean and passes it through `SettingsPanel` and `PreviewPanel` to `RenderedPage`. `RenderedPage` adds a semantic root class when cropping is enabled; scoped CSS defaults Markdown figure images to `contain` and overrides them to `cover` only under that class, so preview and export share identical behavior.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, scoped CSS, Vitest, Testing Library.

---

## File Map

- Modify `src/md-image/styles.css`: default Markdown image fit and opt-in crop override.
- Modify `src/md-image/styles.test.ts`: regression assertions for `contain`, `cover`, and watermark isolation.
- Modify `src/md-image/components/RenderedPage.tsx`: accept the crop setting and expose it as a root class.
- Modify `src/md-image/components/RenderedPage.test.tsx`: verify the root class is opt-in.
- Modify `src/md-image/components/SettingsPanel.tsx`: render the controlled checkbox.
- Modify `src/md-image/components/SettingsPanel.test.tsx`: verify default state and change callback.
- Modify `src/md-image/components/PreviewPanel.tsx`: pass the setting to visible preview and hidden export renders.
- Modify `src/md-image/components/PreviewPanel.test.tsx`: verify both render paths receive the same setting.
- Modify `src/md-image/MarkdownImageApp.tsx`: own, restore, persist, and connect `cropImages`.
- Create `src/md-image/MarkdownImageApp.test.tsx`: verify old-draft default behavior and persistence after enabling crop.

### Task 1: Make Complete Image Display the Rendering Default

**Files:**
- Modify: `src/md-image/styles.test.ts`
- Modify: `src/md-image/components/RenderedPage.test.tsx`
- Modify: `src/md-image/styles.css`
- Modify: `src/md-image/components/RenderedPage.tsx`

- [ ] **Step 1: Write failing style assertions**

Extend the existing Markdown image style test:

```ts
it("shows complete Markdown images by default and crops only when enabled", () => {
  expect(getRule(".xhs-page figure > img")).toContain("max-height: 460px");
  expect(getRule(".xhs-page figure > img")).toContain("object-fit: contain");
  expect(getRule(".xhs-page.crop-markdown-images figure > img")).toContain(
    "object-fit: cover",
  );
});
```

Keep the existing watermark test unchanged so it continues proving the figure rule does not affect `.xhs-watermark-avatar`.

- [ ] **Step 2: Write the failing component assertion**

Add a focused test to `RenderedPage.test.tsx` using `basePage`:

```tsx
it("enables Markdown image cropping only when requested", () => {
  const { rerender } = render(
    <RenderedPage
      page={basePage}
      theme={getThemeById("punk")}
      dimensions={{ width: 1080, height: 1440 }}
    />,
  );

  expect(screen.getByRole("article")).not.toHaveClass("crop-markdown-images");

  rerender(
    <RenderedPage
      page={basePage}
      theme={getThemeById("punk")}
      dimensions={{ width: 1080, height: 1440 }}
      cropImages
    />,
  );

  expect(screen.getByRole("article")).toHaveClass("crop-markdown-images");
});
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
npx vitest run src/md-image/styles.test.ts src/md-image/components/RenderedPage.test.tsx
```

Expected: FAIL because the base rule still contains `object-fit: cover`, the crop override does not exist, and `RenderedPage` does not accept `cropImages`.

- [ ] **Step 4: Implement the minimal render and CSS behavior**

Add the optional prop in `RenderedPage.tsx`:

```ts
type RenderedPageProps = {
  // existing props
  cropImages?: boolean;
};
```

Read it with a default and build the article class:

```tsx
export function RenderedPage({
  // existing props
  cropImages = false,
  scale = 1,
}: RenderedPageProps) {
  // existing implementation
  return (
    <article
      className={`xhs-page theme-${theme.id} motif-${theme.motif}${
        cropImages ? " crop-markdown-images" : ""
      }`}
      style={style}
    >
```

Change and extend the scoped image CSS while retaining the existing width and height limit:

```css
.xhs-page figure > img {
  display: block;
  width: 100%;
  max-height: 460px;
  object-fit: contain;
  border-radius: max(0px, calc(var(--syntax-image-radius) - 10px));
}

.xhs-page.crop-markdown-images figure > img {
  object-fit: cover;
}
```

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run the same Vitest command. Expected: both test files pass.

- [ ] **Step 6: Commit only Task 1 files**

```bash
git add src/md-image/styles.css src/md-image/styles.test.ts src/md-image/components/RenderedPage.tsx src/md-image/components/RenderedPage.test.tsx
git commit --only src/md-image/styles.css src/md-image/styles.test.ts src/md-image/components/RenderedPage.tsx src/md-image/components/RenderedPage.test.tsx -m "fix: show complete markdown images by default"
```

### Task 2: Add the Controlled Settings Checkbox

**Files:**
- Modify: `src/md-image/components/SettingsPanel.test.tsx`
- Modify: `src/md-image/components/SettingsPanel.tsx`

- [ ] **Step 1: Add the new controlled props to the test fixture**

Extend `baseProps`:

```ts
cropImages: false,
onCropImagesChange: vi.fn(),
```

- [ ] **Step 2: Write the failing interaction test**

```tsx
it("keeps image cropping disabled by default and allows enabling it", () => {
  const onCropImagesChange = vi.fn();

  render(
    <SettingsPanel
      {...baseProps}
      onCropImagesChange={onCropImagesChange}
    />,
  );

  const checkbox = screen.getByLabelText("裁剪图片以填满 460px 区域");
  expect(checkbox).not.toBeChecked();

  fireEvent.click(checkbox);
  expect(onCropImagesChange).toHaveBeenCalledWith(true);
});
```

- [ ] **Step 3: Run the SettingsPanel test and verify RED**

Run:

```bash
npx vitest run src/md-image/components/SettingsPanel.test.tsx
```

Expected: FAIL because the checkbox is absent.

- [ ] **Step 4: Implement the checkbox with existing panel styles**

Add these props to `SettingsPanelProps`, destructure them, and place the controlled checkbox after the fixed-size controls inside the “图片尺寸” section:

```ts
cropImages: boolean;
onCropImagesChange: (enabled: boolean) => void;
```

```tsx
<label className={switchRowClassName}>
  <input
    aria-label="裁剪图片以填满 460px 区域"
    type="checkbox"
    checked={cropImages}
    onChange={(event) => onCropImagesChange(event.target.checked)}
    className={checkboxClassName}
  />
  <span>裁剪图片以填满 460px 区域</span>
</label>
```

- [ ] **Step 5: Run the SettingsPanel test and verify GREEN**

Run the same focused test. Expected: PASS.

- [ ] **Step 6: Commit only Task 2 files**

```bash
git add src/md-image/components/SettingsPanel.tsx src/md-image/components/SettingsPanel.test.tsx
git commit --only src/md-image/components/SettingsPanel.tsx src/md-image/components/SettingsPanel.test.tsx -m "feat: add markdown image crop setting"
```

### Task 3: Apply the Setting to Preview and Export Rendering

**Files:**
- Modify: `src/md-image/components/PreviewPanel.test.tsx`
- Modify: `src/md-image/components/PreviewPanel.tsx`

- [ ] **Step 1: Update existing test renders with the required default**

Add `cropImages={false}` to every existing `PreviewPanel` render in `PreviewPanel.test.tsx` so the prop contract is explicit.

- [ ] **Step 2: Write the failing shared-render-path test**

```tsx
it("uses the same image crop setting for preview and export pages", () => {
  render(
    <PreviewPanel
      pages={[{
        id: "page-1",
        manualGroupIndex: 0,
        estimatedHeight: 700,
        blocks: [],
      }]}
      selectedPageIndex={0}
      theme={getThemeById("punk")}
      typography={typography}
      dimensions={{ width: 1080, height: 1440 }}
      pageDimensions={[{ width: 1080, height: 1440 }]}
      watermark={watermark}
      cropImages
      autoHeightEnabled={false}
      isExporting={false}
      onPageChange={vi.fn()}
      registerPageRef={vi.fn()}
      onExportCurrent={vi.fn()}
      onExportAll={vi.fn()}
    />,
  );

  const pages = screen.getAllByRole("article");
  expect(pages).toHaveLength(2);
  expect(pages.every((page) => page.classList.contains("crop-markdown-images"))).toBe(true);
});
```

- [ ] **Step 3: Run the PreviewPanel test and verify RED**

Run:

```bash
npx vitest run src/md-image/components/PreviewPanel.test.tsx
```

Expected: FAIL because `PreviewPanel` does not accept or forward `cropImages`.

- [ ] **Step 4: Forward the setting through both render paths**

Add to `PreviewPanelProps` and destructuring:

```ts
cropImages: boolean;
```

Pass this prop to both `RenderedPage` calls:

```tsx
<RenderedPage
  // existing props
  cropImages={cropImages}
/>
```

- [ ] **Step 5: Run the PreviewPanel test and verify GREEN**

Run the focused test again. Expected: PASS.

- [ ] **Step 6: Commit only Task 3 files**

```bash
git add src/md-image/components/PreviewPanel.tsx src/md-image/components/PreviewPanel.test.tsx
git commit --only src/md-image/components/PreviewPanel.tsx src/md-image/components/PreviewPanel.test.tsx -m "feat: apply image crop setting to exports"
```

### Task 4: Own and Persist the Setting in the App

**Files:**
- Create: `src/md-image/MarkdownImageApp.test.tsx`
- Modify: `src/md-image/MarkdownImageApp.tsx`

- [ ] **Step 1: Create a focused app-level test with isolated child components**

Create `MarkdownImageApp.test.tsx` with child-component and IndexedDB helper mocks so it tests only state wiring and local storage:

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MarkdownImageApp } from "./MarkdownImageApp";

vi.mock("@/md-image/components/EditorPanel", () => ({
  EditorPanel: () => null,
}));

vi.mock("@/md-image/components/PreviewPanel", () => ({
  PreviewPanel: ({ cropImages }: { cropImages: boolean }) => (
    <output data-testid="preview-crop-state">{String(cropImages)}</output>
  ),
}));

vi.mock("@/md-image/components/SettingsPanel", () => ({
  SettingsPanel: ({
    cropImages,
    onCropImagesChange,
  }: {
    cropImages: boolean;
    onCropImagesChange: (enabled: boolean) => void;
  }) => (
    <input
      aria-label="裁剪图片以填满 460px 区域"
      type="checkbox"
      checked={cropImages}
      onChange={(event) => onCropImagesChange(event.target.checked)}
    />
  ),
}));

vi.mock("@/md-image/lib/localImages", () => ({
  deleteUnusedLocalImages: vi.fn(async () => undefined),
  loadLocalImageSources: vi.fn(async () => ({})),
  saveLocalImage: vi.fn(),
}));

describe("MarkdownImageApp image crop setting", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults old drafts to complete image display", async () => {
    window.localStorage.setItem("xhs-md-image-tool", JSON.stringify({ markdown: "正文" }));

    render(<MarkdownImageApp />);

    expect(screen.getByLabelText("裁剪图片以填满 460px 区域")).not.toBeChecked();
    expect(screen.getByTestId("preview-crop-state")).toHaveTextContent("false");
  });

  it("persists the crop setting after the user enables it", async () => {
    render(<MarkdownImageApp />);

    fireEvent.click(screen.getByLabelText("裁剪图片以填满 460px 区域"));

    expect(screen.getByTestId("preview-crop-state")).toHaveTextContent("true");
    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem("xhs-md-image-tool") ?? "{}",
      ) as { cropImages?: boolean };
      expect(stored.cropImages).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run the app test and verify RED**

Run:

```bash
npx vitest run src/md-image/MarkdownImageApp.test.tsx
```

Expected: FAIL because the app does not provide the mocked children with `cropImages` or `onCropImagesChange`.

- [ ] **Step 3: Implement app state, restoration, persistence, and prop wiring**

Extend `StoredState`:

```ts
cropImages?: boolean;
```

Initialize the setting:

```ts
const [cropImages, setCropImages] = useState(false);
```

Restore only valid booleans:

```ts
if (typeof parsed.cropImages === "boolean") setCropImages(parsed.cropImages);
```

Include `cropImages` in both local-storage object literals and the corresponding effect/callback dependency arrays. Pass it to `PreviewPanel`:

```tsx
cropImages={cropImages}
```

Pass the controlled value and setter to `SettingsPanel`:

```tsx
cropImages={cropImages}
onCropImagesChange={setCropImages}
```

- [ ] **Step 4: Run app and all feature tests and verify GREEN**

Run:

```bash
npx vitest run src/md-image/MarkdownImageApp.test.tsx src/md-image/components/SettingsPanel.test.tsx src/md-image/components/PreviewPanel.test.tsx src/md-image/components/RenderedPage.test.tsx src/md-image/styles.test.ts
```

Expected: all listed test files pass.

- [ ] **Step 5: Commit only Task 4 files**

```bash
git add -N src/md-image/MarkdownImageApp.test.tsx
git add src/md-image/MarkdownImageApp.tsx src/md-image/MarkdownImageApp.test.tsx
git commit --only src/md-image/MarkdownImageApp.tsx src/md-image/MarkdownImageApp.test.tsx -m "feat: persist markdown image crop preference"
```

### Task 5: Final Verification

**Files:**
- No code changes expected.

- [ ] **Step 1: Run the complete test suite**

```bash
npm test
```

Expected: all Vitest tests pass with no unhandled errors.

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: Next.js production build and type checking complete successfully.

- [ ] **Step 3: Inspect the final scoped diff and working tree**

```bash
git diff HEAD~4 -- src/md-image
git status --short
```

Expected: only the listed Markdown image files changed for this feature; pre-existing `public/home/assets/iShot_2026-06-14_10.53.54.png` and `.nvmrc` states remain untouched.
