# Homepage Project Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add direct links to the Markdown card and cover tools in both desktop and mobile homepage navigation.

**Architecture:** Keep the change inside the existing `HeaderNav` component. Render project links from `copy.cards` in the desktop product dropdown and in a compact mobile-only product dropdown, preserving existing copy and routes as the single source of truth.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Vitest, Testing Library

---

## File Structure

- Modify `src/app/page.test.tsx`: assert both desktop and mobile project navigation expose the two direct routes.
- Modify `src/home/components/HeaderNav.tsx`: render project links in the existing desktop dropdown and add a mobile dropdown.

### Task 1: Add direct project navigation

**Files:**
- Modify: `src/app/page.test.tsx`
- Modify: `src/home/components/HeaderNav.tsx`

- [ ] **Step 1: Write the failing navigation test**

Replace the old assertion that the main navigation does not contain the WeChat link with explicit project-link assertions:

```tsx
const mainNavigation = screen.getByRole("navigation", { name: "Main navigation" });
expect(within(mainNavigation).getByRole("link", { name: "md生成卡片" })).toHaveAttribute("href", "/md-card");
expect(within(mainNavigation).getByRole("link", { name: "自媒体封面" })).toHaveAttribute("href", "/cover");

const mobileNavigation = screen.getByRole("navigation", { name: "Mobile navigation" });
expect(within(mobileNavigation).getByRole("link", { name: "md生成卡片" })).toHaveAttribute("href", "/md-card");
expect(within(mobileNavigation).getByRole("link", { name: "自媒体封面" })).toHaveAttribute("href", "/cover");
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx vitest run src/app/page.test.tsx
```

Expected: FAIL because the desktop links and `Mobile navigation` do not exist yet.

- [ ] **Step 3: Render the desktop project links**

In the existing desktop product dropdown in `HeaderNav`, replace the hard-coded `Vibe Coding` anchor with links sourced from `copy.cards`:

```tsx
{copy.cards.map((card) => (
  <a
    className="block whitespace-nowrap rounded-lg px-3.5 py-2 font-[var(--font-misans)] text-[15px] font-normal text-black no-underline transition-colors hover:bg-black/5"
    href={card.href}
    key={card.id}
    role="menuitem"
  >
    {card.title}
  </a>
))}
```

- [ ] **Step 4: Add the compact mobile project dropdown**

Before the existing desktop navigation, add a mobile-only navigation using the same `copy.cards` data:

```tsx
<nav className="group relative hidden items-center max-[640px]:inline-flex" aria-label="Mobile navigation">
  <button type="button" className={navLinkClass}>
    <span>{copy.product}</span>
    <CaretIcon />
  </button>
  <div
    className="invisible absolute right-0 top-full z-10 flex min-w-40 translate-y-1.5 flex-col rounded-xl border border-black/10 bg-white px-2 py-3 opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition duration-300 group-hover:visible group-hover:translate-y-0.5 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0.5 group-focus-within:opacity-100"
    role="menu"
  >
    {copy.cards.map((card) => (
      <a
        className="block whitespace-nowrap rounded-lg px-3.5 py-2 font-[var(--font-misans)] text-[15px] font-normal text-black no-underline transition-colors hover:bg-black/5"
        href={card.href}
        key={card.id}
        role="menuitem"
      >
        {card.title}
      </a>
    ))}
  </div>
</nav>
```

- [ ] **Step 5: Run focused verification and verify GREEN**

Run:

```bash
npx vitest run src/app/page.test.tsx
```

Expected: PASS with the homepage test reporting both desktop and mobile direct links.

- [ ] **Step 6: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all Vitest tests pass without new warnings or errors.

- [ ] **Step 7: Commit the implementation**

```bash
git add src/app/page.test.tsx src/home/components/HeaderNav.tsx
git commit -m "feat: add homepage project navigation links"
```
