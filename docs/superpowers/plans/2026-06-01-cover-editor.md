# Cover Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build an isolated `/cover` editor for Xiaohongshu and WeChat covers with templates, draggable text layers, typography controls, icon insertion, and PNG export.

**Architecture:** Keep cover editor state and data separate from the Markdown tool. Use static template/icon registries in `src/lib/cover.ts`, a client page at `src/app/cover/page.tsx`, and a focused `CoverEditor` component tree under `src/components/cover/`. Reuse only the existing PNG export utility.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind CSS utility classes, Vitest, Testing Library, `html-to-image` through existing export helpers.

---

### Task 1: Cover Domain Model

**Files:**
- Create: `src/lib/cover.ts`
- Test: `src/lib/cover.test.ts`

- [x] Write tests proving both channels have templates, default text layers are valid, and layer updates preserve unrelated layers.
- [x] Implement template/icon registries and pure helpers for layer creation and updates.
- [x] Run `npx vitest run src/lib/cover.test.ts` and confirm pass.

### Task 2: Cover Editor UI

**Files:**
- Create: `src/components/cover/CoverEditor.tsx`
- Test: `src/components/cover/CoverEditor.test.tsx`

- [x] Write tests for rendering templates, adding text, adding an icon, and changing selected text styles.
- [x] Implement three-panel layout using Tailwind classes inside the component.
- [x] Implement canvas selection, text dragging, typography inspector, template switching, format switching, and export button.
- [x] Run `npx vitest run src/components/cover/CoverEditor.test.tsx` and confirm pass.

### Task 3: Routing and Navigation

**Files:**
- Create: `src/app/cover/page.tsx`
- Modify: `src/app/page.tsx`
- Test: existing build coverage

- [x] Add `/cover` route that renders `CoverEditor`.
- [x] Add a prominent home-page navigation button linking to `/cover` without coupling state.
- [x] Keep cover-specific CSS out of `src/app/globals.css`.

### Task 4: Verification

**Files:**
- Verify changed files and commands.

- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Audit requirements against current files before marking complete.
