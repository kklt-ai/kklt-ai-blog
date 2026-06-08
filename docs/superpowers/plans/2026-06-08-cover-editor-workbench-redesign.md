# Cover Editor Workbench Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the `/cover` editor into a professional Mistral-inspired design workbench without changing exported cover templates or editor behavior.

**Architecture:** Keep the current component split and state flow. Apply visual and responsive layout changes inside `CoverEditor`, `CoverTopNav`, `CoverToolPanel`, `CoverPreviewPanel`, `CoverSettingsPanel`, `TextHighlightPicker`, and `TextEffectPicker`; update only tests that assert editor chrome class names.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Vitest, Testing Library, lucide-react.

---

## File Structure

- Modify: `src/cover/components/CoverEditor.tsx`
  - Set the page-level workbench background, column sizing, and save-template dialog visual system.
- Modify: `src/cover/components/CoverTopNav.tsx`
  - Restyle the top product bar, platform segmented control, secondary link, and primary export button.
- Modify: `src/cover/components/CoverToolPanel.tsx`
  - Restyle the left tool rail, resource panels, template cards, text panel, logo cards, background tabs, and background cards.
- Modify: `src/cover/components/CoverPreviewPanel.tsx`
  - Restyle the central canvas workspace, workbench grid, canvas shadow, floating toolbar, and status toast.
- Modify: `src/cover/components/CoverSettingsPanel.tsx`
  - Restyle right-side controls, empty state, typography controls, spacing sliders, color row, and icon settings.
- Modify: `src/cover/components/TextHighlightPicker.tsx`
  - Match popover button/card selected states to the new workbench chrome.
- Modify: `src/cover/components/TextEffectPicker.tsx`
  - Match popover button/card selected states to the new workbench chrome.
- Modify: `src/cover/components/CoverEditor.customTemplates.test.tsx`
  - Update class expectations for the floating template toolbar after the visual repositioning.

No new files are required. Do not change cover template data, `CoverCanvasContent` export rendering, or model helpers.

## Task 1: Update Tests For Floating Toolbar Chrome

**Files:**
- Modify: `src/cover/components/CoverEditor.customTemplates.test.tsx`

- [ ] **Step 1: Update the tested position classes**

In `src/cover/components/CoverEditor.customTemplates.test.tsx`, replace this assertion:

```tsx
expect(saveButton).toHaveClass("absolute", "right-14", "top-4");
```

with:

```tsx
expect(saveButton).toHaveClass("inline-flex", "h-10", "rounded-md");
expect(saveButton.closest("[data-cover-preview-toolbar='true']")).toHaveClass(
  "absolute",
  "right-5",
  "top-5",
);
```

- [ ] **Step 2: Run the targeted test and verify it fails before implementation**

Run:

```bash
npx vitest run src/cover/components/CoverEditor.customTemplates.test.tsx
```

Expected: fail because the current preview panel does not have `data-cover-preview-toolbar="true"` and still positions the save button directly with `right-14 top-4`.

- [ ] **Step 3: Commit the failing test change**

Run:

```bash
git add src/cover/components/CoverEditor.customTemplates.test.tsx
git commit -m "test: update cover toolbar chrome expectation"
```

## Task 2: Restyle Page Shell, Top Nav, And Dialog

**Files:**
- Modify: `src/cover/components/CoverEditor.tsx`
- Modify: `src/cover/components/CoverTopNav.tsx`

- [ ] **Step 1: Restyle the page shell and editor grid**

In `src/cover/components/CoverEditor.tsx`, replace the `<main>` className with:

```tsx
className="flex min-h-screen flex-col bg-[#fff8e0] text-[#1f1f1f] xl:h-screen xl:overflow-hidden"
```

Replace the editor grid className with:

```tsx
className="grid min-h-0 flex-1 grid-cols-[minmax(344px,400px)_minmax(460px,1fr)_minmax(360px,400px)] border-t border-[#e6d5a8]/70 max-xl:grid-cols-1"
```

- [ ] **Step 2: Restyle the save-template dialog**

In `src/cover/components/CoverEditor.tsx`, update the dialog overlay className to:

```tsx
className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1f1f]/45 px-4"
```

Update the modal panel className to:

```tsx
className="w-full max-w-md rounded-xl border border-[#e6d5a8] bg-white p-6 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)]"
```

Update the dialog title className to:

```tsx
className="text-lg font-semibold text-[#1f1f1f]"
```

Update the body copy className to:

```tsx
className="mt-3 space-y-2 text-sm font-medium leading-6 text-[#4a4a4a]"
```

Update the warning message className to:

```tsx
className="mt-4 rounded-md border border-[#e6d5a8] bg-[#fff8e0] px-3 py-2 text-sm font-semibold text-[#cc3a05]"
```

Update the cancel button className to:

```tsx
className="rounded-md border border-[#c7c7c7] bg-white px-4 py-2 text-sm font-semibold text-[#3d3d3d] transition hover:border-[#8a8a8a] hover:bg-[#fffaeb] hover:text-[#1f1f1f]"
```

Update the confirm button className to:

```tsx
className="rounded-md bg-[#fa520f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#cc3a05]"
```

- [ ] **Step 3: Restyle the top nav**

In `src/cover/components/CoverTopNav.tsx`, update the header className to:

```tsx
className="relative z-30 shrink-0 border-b border-[#e6d5a8] bg-white/95 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur"
```

Update the nav className to:

```tsx
className="grid min-h-[72px] grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] items-center gap-4 px-5 py-3 max-lg:grid max-lg:grid-cols-[1fr_auto] max-sm:gap-3 max-sm:px-3"
```

Update the title classes to:

```tsx
<p className="truncate text-lg font-semibold tracking-normal text-[#1f1f1f]">封面设计</p>
<p className="truncate text-xs font-medium text-[#6a6a6a] max-sm:hidden">
```

Update the platform group className to:

```tsx
className="grid min-h-11 w-[240px] grid-cols-2 rounded-md border border-[#e6d5a8] bg-[#fff8e0] p-1 justify-self-center max-sm:order-3 max-sm:col-span-2 max-sm:w-full"
```

Update platform button className construction so active and inactive states are:

```tsx
item.id === channelId
  ? "bg-[#1f1f1f] text-white shadow-sm"
  : "text-[#6a6a6a] hover:bg-white hover:text-[#1f1f1f]"
```

Update the Markdown link className to:

```tsx
className="inline-flex h-11 items-center justify-center rounded-md border border-[#c7c7c7] bg-white px-4 text-sm font-semibold text-[#3d3d3d] shadow-sm transition hover:border-[#8a8a8a] hover:bg-[#fffaeb] hover:text-[#1f1f1f] max-[420px]:px-3"
```

Update the export button className to:

```tsx
className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#fa520f] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#cc3a05] disabled:opacity-60 max-[420px]:px-3"
```

- [ ] **Step 4: Run top-level cover editor test**

Run:

```bash
npx vitest run src/cover/components/CoverEditor.test.tsx
```

Expected: pass.

- [ ] **Step 5: Commit shell and nav changes**

Run:

```bash
git add src/cover/components/CoverEditor.tsx src/cover/components/CoverTopNav.tsx
git commit -m "style: restyle cover workbench shell"
```

## Task 3: Restyle Left Tool And Resource Panel

**Files:**
- Modify: `src/cover/components/CoverToolPanel.tsx`

- [ ] **Step 1: Restyle template thumbnail frames**

In `TemplateThumbnail`, update the thumbnail className to:

```tsx
"mx-auto mb-2 block overflow-hidden rounded-md border border-[#ededed] bg-white bg-cover bg-center"
```

- [ ] **Step 2: Restyle `ToolNavigation`**

Update the nav className to:

```tsx
className="flex w-[76px] shrink-0 flex-col gap-2 border-r border-[#e5e5e5] bg-[#fffaeb] px-2 py-4 max-sm:w-full max-sm:flex-row max-sm:border-b max-sm:border-r-0"
```

Update tool button active and inactive classes to:

```tsx
"flex h-[66px] flex-col items-center justify-center gap-1 rounded-md border text-xs font-semibold transition max-sm:h-14 max-sm:flex-1",
active
  ? "border-[#fa520f] bg-white text-[#1f1f1f] shadow-sm"
  : "border-transparent text-[#6a6a6a] hover:border-[#e6d5a8] hover:bg-white hover:text-[#1f1f1f]"
```

- [ ] **Step 3: Restyle template cards and section labels**

In `TemplatePanel`, update template button active and inactive classes to:

```tsx
"w-full rounded-lg border p-2 text-center transition",
template.id === activeTemplate.id
  ? "border-[#fa520f] bg-[#fffaeb] ring-1 ring-[#fa520f]/25"
  : "border-[#ededed] bg-white hover:border-[#e6d5a8] hover:bg-[#fffaeb]"
```

Update the heading row classes:

```tsx
<h2 className="text-lg font-semibold text-[#1f1f1f]">模板</h2>
<span className="text-sm font-medium text-[#6a6a6a]">{templates.length} 款</span>
```

Update section label className:

```tsx
className="col-span-full text-xs font-semibold uppercase tracking-[0.08em] text-[#8a8a8a]"
```

- [ ] **Step 4: Restyle text panel**

In `TextPanel`, update the section heading to:

```tsx
<h2 className="mb-5 text-lg font-semibold text-[#1f1f1f]">文字</h2>
```

Update the add button className to:

```tsx
className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1f1f1f] px-3 py-3 font-semibold text-white transition hover:bg-[#3d3d3d]"
```

Update the sample grid className to:

```tsx
className="grid grid-cols-2 gap-3 rounded-lg border border-[#e6d5a8] bg-[#fff8e0] p-3"
```

Update sample button className to:

```tsx
className="rounded-md border border-[#ededed] bg-white px-3 py-4 text-center text-sm font-semibold text-[#6a6a6a] transition hover:border-[#e6d5a8] hover:text-[#1f1f1f]"
```

- [ ] **Step 5: Restyle image panel**

In `ImagePanel`, update the heading to:

```tsx
<h2 className="text-lg font-semibold text-[#1f1f1f]">图片素材</h2>
```

Update external-link button className:

```tsx
className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e5e5e5] bg-white text-[#6a6a6a] transition hover:border-[#c7c7c7] hover:bg-[#fffaeb] hover:text-[#1f1f1f]"
```

Update search input className:

```tsx
className="mb-4 h-11 w-full rounded-md border border-[#c7c7c7] bg-white px-3 text-sm font-medium text-[#1f1f1f] outline-none transition placeholder:text-[#a8a8a8] focus:border-[#fa520f] focus:ring-2 focus:ring-[#fa520f]/15"
```

Update logo card className:

```tsx
className="rounded-lg border border-[#ededed] bg-white p-3 text-sm font-semibold text-[#3d3d3d] transition hover:border-[#e6d5a8] hover:bg-[#fffaeb]"
```

Update logo icon frame className prefix to:

```tsx
"mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md border border-[#e5e5e5] text-xs"
```

- [ ] **Step 6: Restyle background panel**

In `BackgroundPanel`, update heading className:

```tsx
className="mb-5 text-lg font-semibold text-[#1f1f1f]"
```

Update tab container className:

```tsx
className="mb-4 grid grid-cols-2 gap-2 rounded-md border border-[#e6d5a8] bg-[#fff8e0] p-1"
```

Update tab button active/inactive states:

```tsx
"rounded-md px-3 py-2 text-sm font-semibold transition",
backgroundTabId === tab.id
  ? "bg-white text-[#1f1f1f] shadow-sm"
  : "text-[#6a6a6a] hover:text-[#1f1f1f]"
```

Update image and color background card active/inactive states:

```tsx
"rounded-lg border bg-white p-2 text-left transition",
selectedBackground.kind === "image" && selectedBackground.id === background.id
  ? "border-[#fa520f] ring-1 ring-[#fa520f]/25"
  : "border-[#ededed] hover:border-[#e6d5a8] hover:bg-[#fffaeb]"
```

and:

```tsx
"rounded-lg border bg-white p-2 text-left transition",
selectedBackground.kind === "color" && selectedBackground.id === template.id
  ? "border-[#fa520f] ring-1 ring-[#fa520f]/25"
  : "border-[#ededed] hover:border-[#e6d5a8] hover:bg-[#fffaeb]"
```

- [ ] **Step 7: Restyle panel shell**

In `CoverToolPanel`, update the aside className to:

```tsx
className="flex min-h-0 border-r border-[#e5e5e5] bg-white max-xl:min-h-[520px] max-sm:flex-col xl:h-full"
```

Update content wrapper className to:

```tsx
className="min-h-0 flex-1 overflow-hidden px-5 py-5"
```

- [ ] **Step 8: Run cover editor test**

Run:

```bash
npx vitest run src/cover/components/CoverEditor.test.tsx
```

Expected: pass.

- [ ] **Step 9: Commit left panel changes**

Run:

```bash
git add src/cover/components/CoverToolPanel.tsx
git commit -m "style: restyle cover resource panel"
```

## Task 4: Restyle Center Canvas Workspace

**Files:**
- Modify: `src/cover/components/CoverPreviewPanel.tsx`

- [ ] **Step 1: Replace direct floating buttons with a toolbar wrapper**

In `CoverPreviewPanel`, wrap the save and copy buttons in:

```tsx
<div
  data-cover-preview-toolbar="true"
  className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-lg border border-[#e6d5a8] bg-white/95 p-1 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur"
>
  ...
</div>
```

Inside that wrapper, set the save button className to:

```tsx
className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1f1f1f] px-3 text-sm font-semibold text-white transition hover:bg-[#3d3d3d]"
```

Set the copy button className to:

```tsx
className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#6a6a6a] transition hover:bg-[#fffaeb] hover:text-[#1f1f1f]"
```

- [ ] **Step 2: Restyle preview section and workbench background**

Update the preview `<section>` className to:

```tsx
className="relative min-w-0 bg-[#fff8e0] p-6 max-sm:p-3"
```

Update the canvas centering wrapper className to:

```tsx
className="flex min-h-[calc(100vh-48px)] items-center justify-center overflow-auto rounded-xl border border-[#e6d5a8]/70 bg-[linear-gradient(rgba(230,213,168,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(230,213,168,0.28)_1px,transparent_1px)] bg-[size:24px_24px] p-3 max-xl:min-h-[720px]"
```

Update the canvas className shadow segment to:

```tsx
"absolute left-0 top-0 overflow-hidden shadow-[0_18px_42px_rgba(31,31,31,0.16)] ring-1 ring-[#1f1f1f]/10"
```

- [ ] **Step 3: Restyle snap guides and status toast**

Update vertical guide className to:

```tsx
className="pointer-events-none absolute left-1/2 top-0 z-20 h-full w-px -translate-x-1/2 bg-[#fa520f] shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_0_18px_rgba(250,82,15,0.55)]"
```

Update horizontal guide className to:

```tsx
className="pointer-events-none absolute left-0 top-1/2 z-20 h-px w-full -translate-y-1/2 bg-[#fa520f] shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_0_18px_rgba(250,82,15,0.55)]"
```

Update the status toast className to:

```tsx
className="absolute right-5 top-20 z-20 rounded-md bg-[#1f1f1f] px-3 py-2 text-xs font-semibold text-white shadow-lg"
```

- [ ] **Step 4: Run preview and custom-template tests**

Run:

```bash
npx vitest run src/cover/components/CoverPreviewPanel.test.tsx src/cover/components/CoverEditor.customTemplates.test.tsx
```

Expected: pass.

- [ ] **Step 5: Commit canvas workspace changes**

Run:

```bash
git add src/cover/components/CoverPreviewPanel.tsx src/cover/components/CoverEditor.customTemplates.test.tsx
git commit -m "style: restyle cover canvas workspace"
```

## Task 5: Restyle Right Settings Panel

**Files:**
- Modify: `src/cover/components/CoverSettingsPanel.tsx`

- [ ] **Step 1: Add small setting section labels**

Add this helper near `TextStyleButton`:

```tsx
function SettingSectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#8a8a8a]">
      {children}
    </p>
  );
}
```

Then wrap existing grouped controls in `TextLayerSettings` with labels:

```tsx
<div>
  <SettingSectionLabel>Typography</SettingSectionLabel>
  <div className="grid grid-cols-[1fr_86px] gap-2">...</div>
</div>
<div>
  <SettingSectionLabel>Style</SettingSectionLabel>
  <div className="grid grid-cols-3 gap-1 rounded-md border border-[#e6d5a8] bg-[#fff8e0] p-1">...</div>
</div>
<div>
  <SettingSectionLabel>Align</SettingSectionLabel>
  <div className="grid grid-cols-3 gap-1 rounded-md border border-[#e6d5a8] bg-[#fff8e0] p-1">...</div>
</div>
<div>
  <SettingSectionLabel>Spacing</SettingSectionLabel>
  <div className="grid grid-cols-2 gap-2">...</div>
</div>
<div>
  <SettingSectionLabel>Effects</SettingSectionLabel>
  <div role="group" aria-label="文字装饰" className="flex flex-wrap items-center gap-2">...</div>
</div>
```

- [ ] **Step 2: Restyle slider, buttons, select, and inputs**

In `SpacingDragControl`, update the root className active/inactive states to:

```tsx
"grid h-12 cursor-ew-resize select-none grid-cols-[1fr_auto_1fr] items-center rounded-md border border-[#e6d5a8] bg-[#fff8e0] px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-[#fa520f]/20",
dragging ? "bg-white shadow-sm ring-2 ring-[#fa520f]" : "hover:bg-white"
```

Update label/value text colors to:

```tsx
<span className="justify-self-start text-[#6a6a6a]">{label}</span>
<span className="min-w-12 justify-self-center text-center text-[#1f1f1f]">{value}</span>
<span className="flex min-w-10 items-center justify-end gap-1 text-[#6a6a6a]">
```

In `TextStyleButton`, update className states:

```tsx
"inline-flex h-10 items-center justify-center rounded-md transition",
active ? "bg-white text-[#1f1f1f] shadow-sm" : "text-[#6a6a6a] hover:bg-white hover:text-[#1f1f1f]"
```

Update select className:

```tsx
className="h-12 w-full rounded-md border border-[#c7c7c7] bg-white px-3 text-sm font-semibold text-[#1f1f1f] outline-none transition focus:border-[#fa520f] focus:ring-2 focus:ring-[#fa520f]/15"
```

Update number input className:

```tsx
className="h-12 w-full rounded-md border border-[#c7c7c7] bg-white px-3 text-center text-sm font-semibold text-[#1f1f1f] outline-none transition focus:border-[#fa520f] focus:ring-2 focus:ring-[#fa520f]/15"
```

Update color row className:

```tsx
className="flex items-center justify-between gap-3 border-y border-[#ededed] py-4"
```

Update color input className:

```tsx
className="h-11 w-16 rounded-md border border-[#e5e5e5] bg-white p-1"
```

- [ ] **Step 3: Restyle icon settings and aside shell**

In `IconLayerSettings`, update the icon card className:

```tsx
className="rounded-lg border border-[#e6d5a8] bg-[#fff8e0] p-4"
```

Update icon helper text:

```tsx
className="mt-1 text-sm font-medium text-[#6a6a6a]"
```

Update range input:

```tsx
className="w-full accent-[#fa520f]"
```

Update aside className:

```tsx
className="border-l border-[#e5e5e5] bg-white px-5 py-5 max-xl:border-l-0 max-xl:border-t"
```

Update empty state className:

```tsx
className="rounded-lg border border-[#e6d5a8] bg-[#fff8e0] p-4 text-center text-sm font-semibold text-[#6a6a6a]"
```

- [ ] **Step 4: Run cover editor test**

Run:

```bash
npx vitest run src/cover/components/CoverEditor.test.tsx
```

Expected: pass.

- [ ] **Step 5: Commit settings panel changes**

Run:

```bash
git add src/cover/components/CoverSettingsPanel.tsx
git commit -m "style: restyle cover settings panel"
```

## Task 6: Restyle Text Effect And Highlight Pickers

**Files:**
- Modify: `src/cover/components/TextHighlightPicker.tsx`
- Modify: `src/cover/components/TextEffectPicker.tsx`

- [ ] **Step 1: Restyle highlight picker**

In `TextHighlightPicker.tsx`, update `HighlightPreview` button className states:

```tsx
"flex aspect-square min-h-[82px] items-center justify-center rounded-lg border bg-[#fff8e0] p-2 transition",
active
  ? "border-[#fa520f] bg-white ring-2 ring-[#fa520f]/25"
  : "border-[#ededed] hover:border-[#e6d5a8] hover:bg-white"
```

Update the trigger button className:

```tsx
className="inline-flex h-12 items-center gap-3 rounded-md border border-[#e6d5a8] bg-[#fff8e0] px-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#fa520f]/20"
```

Update the trigger icon span className:

```tsx
className="grid h-8 w-8 place-items-center rounded-md bg-white text-[#6a6a6a] shadow-sm"
```

Update popover className:

```tsx
className="absolute right-0 z-20 mt-3 w-[330px] rounded-xl border border-[#e6d5a8] bg-white p-3 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)]"
```

- [ ] **Step 2: Restyle effect picker**

In `TextEffectPicker.tsx`, update `EffectCard` button className states:

```tsx
"relative min-h-[96px] rounded-lg border bg-[#fff8e0] p-2 text-center transition",
active
  ? "border-[#fa520f] bg-white ring-2 ring-[#fa520f]/25"
  : "border-[#ededed] hover:border-[#e6d5a8] hover:bg-white"
```

Update trigger button className:

```tsx
className="inline-flex h-12 items-center gap-3 rounded-md border border-[#e6d5a8] bg-[#fff8e0] px-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#fa520f]/20"
```

Update trigger icon span className:

```tsx
className="grid h-8 w-8 place-items-center rounded-md bg-white text-[#6a6a6a] shadow-sm"
```

Update popover className:

```tsx
className="absolute right-0 z-20 mt-3 w-[360px] rounded-xl border border-[#e6d5a8] bg-white p-3 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)]"
```

Update category button active/inactive states:

```tsx
"min-h-11 rounded-md px-3 text-left text-sm font-semibold transition",
active
  ? "bg-[#fff8e0] text-[#1f1f1f]"
  : "text-[#6a6a6a] hover:bg-[#fffaeb] hover:text-[#1f1f1f]"
```

- [ ] **Step 3: Run cover editor component test**

Run:

```bash
npx vitest run src/cover/components/CoverEditor.test.tsx
```

Expected: pass.

- [ ] **Step 4: Commit picker changes**

Run:

```bash
git add src/cover/components/TextHighlightPicker.tsx src/cover/components/TextEffectPicker.tsx
git commit -m "style: restyle cover text pickers"
```

## Task 7: Final Verification

**Files:**
- Verify working tree and all modified files.

- [ ] **Step 1: Run all relevant cover component tests**

Run:

```bash
npx vitest run src/cover/components/CoverEditor.test.tsx src/cover/components/CoverPreviewPanel.test.tsx src/cover/components/CoverEditor.customTemplates.test.tsx
```

Expected: all tests pass.

- [ ] **Step 2: Run git diff review**

Run:

```bash
git diff --stat
git diff -- src/cover/components/CoverEditor.tsx src/cover/components/CoverTopNav.tsx src/cover/components/CoverToolPanel.tsx src/cover/components/CoverPreviewPanel.tsx src/cover/components/CoverSettingsPanel.tsx src/cover/components/TextHighlightPicker.tsx src/cover/components/TextEffectPicker.tsx src/cover/components/CoverEditor.customTemplates.test.tsx
```

Expected: only `/cover` editor UI files and the related test assertion changed.

- [ ] **Step 3: Optional local visual check**

Run:

```bash
npm run dev
```

Open `/cover` and verify:

- Top navigation uses white/cream surfaces and orange export button.
- Left tool rail is compact and resource cards use thin borders.
- Canvas workspace has cream workbench background, subtle grid, centered canvas, and compact floating toolbar.
- Right settings panel has grouped controls and orange focus accents.
- Export still downloads the same cover content.

- [ ] **Step 4: Commit any final adjustments**

If final visual adjustments are needed, commit only those changed files:

```bash
git add <changed-files>
git commit -m "style: polish cover workbench redesign"
```
