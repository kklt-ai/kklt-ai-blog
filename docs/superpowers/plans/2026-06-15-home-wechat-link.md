# Homepage WeChat Link and Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage's primary WeChat CTA open the configured public-account album, remove the duplicate header entry, and simplify the footer to an author link.

**Architecture:** Keep the external URL in `src/home/content.ts`, following the existing `GITHUB_URL` pattern. Reuse that constant from the hero and footer, remove only the redundant header anchor, and cover all visible behavior in the existing homepage test.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

## File Structure

- Modify `src/app/page.test.tsx`: assert the header, hero CTA, footer link, and removed footer content.
- Modify `src/home/content.ts`: define the shared `WECHAT_URL` constant.
- Modify `src/home/components/HeaderNav.tsx`: remove the duplicate WeChat navigation anchor.
- Modify `src/home/components/HeroSection.tsx`: use `WECHAT_URL` for the primary WeChat CTA.
- Modify `src/home/components/HomeFooter.tsx`: replace template links with the linked author signature and reduce footer height.

### Task 1: Describe the homepage behavior in a failing test

**Files:**
- Modify: `src/app/page.test.tsx`

- [ ] **Step 1: Add assertions for the desired navigation, CTA, and footer behavior**

Import `within` and `WECHAT_URL`, then add these assertions inside the existing homepage test after rendering:

```tsx
const mainNavigation = screen.getByRole("navigation", { name: "Main navigation" });
expect(within(mainNavigation).queryByRole("link", { name: "公众号" })).not.toBeInTheDocument();

const wechatLinks = screen.getAllByRole("link", { name: "公众号" });
expect(wechatLinks).toHaveLength(1);
expect(wechatLinks[0]).toHaveAttribute("href", WECHAT_URL);
expect(wechatLinks[0]).toHaveAttribute("target", "_blank");
expect(wechatLinks[0]).toHaveAttribute("rel", "noreferrer");

const authorLink = screen.getByRole("link", { name: "卡卡罗特AI" });
expect(authorLink).toHaveAttribute("href", WECHAT_URL);
expect(authorLink).toHaveAttribute("target", "_blank");
expect(authorLink).toHaveAttribute("rel", "noreferrer");
expect(screen.getByText("公众号作者：")).toBeInTheDocument();
expect(screen.queryByText(/Copyright/)).not.toBeInTheDocument();
expect(screen.queryByText("卡卡罗特AI Vibe Coding Works")).not.toBeInTheDocument();
expect(screen.queryByText("AI 内容分享与工具实验室")).not.toBeInTheDocument();
expect(screen.queryByText("Cookie Policy")).not.toBeInTheDocument();
expect(screen.queryByRole("button", { name: "Cookie Preferences" })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx vitest run src/app/page.test.tsx
```

Expected: FAIL because `WECHAT_URL` is not exported yet and the current header/footer behavior does not meet the assertions.

### Task 2: Implement the shared link and homepage UI changes

**Files:**
- Modify: `src/home/content.ts`
- Modify: `src/home/components/HeaderNav.tsx`
- Modify: `src/home/components/HeroSection.tsx`
- Modify: `src/home/components/HomeFooter.tsx`

- [ ] **Step 1: Add the shared WeChat album constant**

Add beside `GITHUB_URL` in `src/home/content.ts`:

```ts
export const WECHAT_URL = "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzYyMjkwMjg0Ng==&action=getalbum&album_id=4260253598405459979&subscene=159&subscene=189&scenenote=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzYyMjkwMjg0Ng%3D%3D%26mid%3D2247484911%26idx%3D1%26sn%3D9e7a9a8d209fca87fe9107d545167302%26chksm%3Dffcfaebec8b827a8d655c7c81aae1d9f4b66e341320e7d5742e5b6ea92be9f4a523f10decd35%26cur_album_id%3D4260253598405459979%26scene%3D189%23wechat_redirect&nolastread=1#wechat_redirect";
```

- [ ] **Step 2: Remove the duplicate header link**

Delete this anchor from `src/home/components/HeaderNav.tsx`:

```tsx
<a className={navLinkClass} href="#wechat">
  {copy.blog}
</a>
```

- [ ] **Step 3: Point the hero CTA at the shared external URL**

Import `WECHAT_URL` from `../content` and change the primary CTA to:

```tsx
<CtaButton href={WECHAT_URL} primary>
  公众号
</CtaButton>
```

- [ ] **Step 4: Replace the footer content**

Import `WECHAT_URL` and replace `HomeFooter` with:

```tsx
import { WECHAT_URL } from "../content";

export function HomeFooter() {
  return (
    <footer className="flex min-h-[180px] items-center justify-center bg-[#f5f4ef] px-[100px] py-10 max-[640px]:min-h-[150px] max-[640px]:px-9">
      <p className="m-0 text-center text-xs font-normal tracking-[0.8px] text-[#504f49] max-[640px]:text-[10px] max-[640px]:tracking-[0.3px]">
        <span>公众号作者：</span>
        <a
          className="text-inherit underline decoration-[0.5px] underline-offset-4 transition-colors hover:text-[var(--color-ink)]"
          href={WECHAT_URL}
          target="_blank"
          rel="noreferrer"
        >
          卡卡罗特AI
        </a>
      </p>
    </footer>
  );
}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
npx vitest run src/app/page.test.tsx
```

Expected: PASS with one passing test and no warnings introduced by this change.

### Task 3: Verify the complete change

**Files:**
- Verify all modified files above.

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm test
```

Expected: all Vitest tests pass.

- [ ] **Step 2: Check formatting and patch integrity**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 3: Review the scoped diff**

Run:

```bash
git diff -- src/app/page.test.tsx src/home/content.ts src/home/components/HeaderNav.tsx src/home/components/HeroSection.tsx src/home/components/HomeFooter.tsx
```

Expected: only the requested homepage navigation, WeChat URL, CTA, footer, and test changes.
