# 首页公众号入口与页脚优化设计

## 目标

首页不再在顶部导航重复展示“公众号”入口。主视觉区域的“公众号”按钮打开指定微信公众号文章合集，链接集中定义，便于后续替换。页脚移除模板化版权和无实际页面的入口，改为简洁的公众号作者署名。

## 方案

- 在 `src/home/content.ts` 中新增 `WECHAT_URL` 常量，保存完整的微信公众号文章合集 URL。
- 从 `src/home/components/HeaderNav.tsx` 删除顶部导航中的公众号链接，不改动其他导航项和语言文案结构。
- 在 `src/home/components/HeroSection.tsx` 中使用 `WECHAT_URL` 作为主视觉“公众号”按钮的 `href`。
- 继续复用 `CtaButton` 现有的外部链接行为，使按钮在新标签页打开，并带有 `rel="noreferrer"`。
- 保留主视觉中的公众号二维码卡片及其 `id="wechat"`，避免扩大本次改动范围。
- 将 `src/home/components/HomeFooter.tsx` 简化为“公众号作者：卡卡罗特AI”，其中“卡卡罗特AI”使用 `WECHAT_URL`，并在新标签页打开。
- 删除页脚中的固定年份版权、Vibe Coding Works、AI 内容分享与工具实验室、Cookie Policy 和 Cookie Preferences。
- 适当缩短页脚的最小高度，保留现有背景色、居中布局和响应式文字样式。

## 测试

在 `src/app/page.test.tsx` 增加首页行为断言：

- 顶部主导航中不再出现“公众号”链接。
- 主视觉“公众号”链接指向 `WECHAT_URL`。
- 外部链接使用 `target="_blank"` 和 `rel="noreferrer"`。
- 页脚显示“公众号作者：卡卡罗特AI”，作者链接指向 `WECHAT_URL`。
- 页脚不再显示旧版权、作品实验室和 Cookie 相关文案或控件。

先运行新增测试并确认它因当前行为不符合要求而失败，再实现最小代码改动并重新运行该测试。最后运行完整 Vitest 测试套件，确认没有首页回归。

## 非目标

- 不删除或修改公众号二维码卡片。
- 不修改中英文文案。
- 不调整页脚以外的首页布局、样式或动画。
- 不修改公众号 URL 之外的外部链接。
