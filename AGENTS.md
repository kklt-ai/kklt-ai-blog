# AGENTS.md

本文件给参与本仓库维护的 AI agent 和协作者使用。修改前请先读完本文件，并以当前项目结构和发布方式为准。

## 项目概览

这是「卡卡罗特AI」的 GitHub Pages + Jekyll 博客，面向中文用户发布 AI 工具教程、ChatGPT/Codex 使用技巧、AI 编程实践和自动化工作流内容。

- 站点标题：`卡卡罗特AI`
- 站点地址：`https://kklt-ai.github.io/kklt-ai-blog/`
- 语言与时区：`zh-CN`、`Asia/Shanghai`
- 主题：`mmistakes/so-simple-theme@3.2.0`
- 部署：推送到 `main` 后由 GitHub Actions 构建并部署到 GitHub Pages

## 技术栈与命令

本项目使用 Ruby/Jekyll，不使用 Node/Vite/Next 等前端构建工具。

常用命令：

```sh
bundle install
bundle exec jekyll serve --livereload
bundle exec jekyll build
```

本地预览默认地址通常是 `http://127.0.0.1:4000/kklt-ai-blog/`。如果只验证构建，运行 `bundle exec jekyll build` 即可。

## 目录结构

- `_config.yml`：站点核心配置、主题、分页、permalink、作者信息、插件和排除项。
- `_posts/`：博客文章。文件名必须使用 `YYYY-MM-DD-slug.md` 格式。
- `_layouts/home.html`：首页布局，自定义头像、标题、摘要列表和分页。
- `_layouts/post.html`：文章页布局，自定义作者卡片、正文区域和右侧/移动端文章大纲。
- `_includes/head-custom.html`：注入自定义 CSS 和 JS。
- `_data/navigation.yml`：顶部导航。
- `_data/text.yml`：So Simple 主题中文文案。
- `assets/css/home.css`：首页、文章页、归档、分类、标签页的主要自定义样式。
- `assets/js/taxonomy-filter.js`：分类和标签页的客户端筛选交互。
- `assets/images/`：站点头像、公众号二维码和文章图片。
- `.github/workflows/pages.yml`：GitHub Pages 自动部署流程。
- `_site/`：Jekyll 生成目录，已被忽略，不要手动编辑或提交。

## 内容规范

文章以中文为主，风格可以口语化，但应保持清楚、直接、可复现。新增文章放在 `_posts/`，并至少包含这些 front matter：

```yaml
---
title: "文章标题"
description: "一句话说明文章内容，兼顾搜索摘要。"
date: 2026-06-28 00:00:00 +0800
categories:
  - AI工具教程
tags:
  - ChatGPT
  - Codex
image:
  path: "/assets/images/yyyy-mm-dd-slug/01.png"
  thumbnail: "/assets/images/yyyy-mm-dd-slug/01.png"
share: true
---
```

文章正文如需显示大纲，保留：

```liquid
{% include toc %}
```

标题层级从 `##` 开始组织正文。`_layouts/post.html` 会自动读取 `h2`、`h3` 生成文章大纲；没有显式 toc 时，也会用页面标题自动生成大纲链接。

## 图片规范

每篇文章的图片建议放在独立目录：

```text
assets/images/yyyy-mm-dd-slug/
```

Markdown 中引用图片时使用 `relative_url`，以兼容 `baseurl: /kklt-ai-blog`：

```md
![]({{ '/assets/images/yyyy-mm-dd-slug/01.png' | relative_url }})
```

不要在正文里使用站点根路径以外的裸相对路径引用图片。新增封面图时同步更新 front matter 的 `image.path` 和 `image.thumbnail`。

## 样式与交互约定

当前视觉风格是黑色页面背景、白色内容区域、强对比文字、Georgia/中文宋体风格标题，以及紧凑的文章阅读布局。修改样式时优先延续 `assets/css/home.css` 的现有选择器组织方式。

- 首页、文章页、文章归档、分类、标签页分别依赖 `body.layout--home`、`body.layout--post`、`body.layout--posts`、`body.layout--categories`、`body.layout--tags`。
- 不要随意恢复 So Simple 默认 masthead；当前项目有自定义导航外观。
- 保持移动端 `@media (max-width: 760px)` 的阅读顺序：作者信息、文章大纲、正文。
- 修改分类/标签交互时，注意 `assets/js/taxonomy-filter.js` 依赖 `.taxonomy-index`、`.taxonomy-section`、`layout--categories` 和 `layout--tags`。

## 配置与导航

新增页面后，如需出现在顶部导航，修改 `_data/navigation.yml`。修改全站标题、描述、作者、分页、链接结构时，优先改 `_config.yml`。

站点使用 `permalink: /:title/`，改文章 slug 会改变线上 URL；除非明确需要，否则不要重命名已发布文章文件。

## 部署与验证

提交前至少执行：

```sh
bundle exec jekyll build
```

涉及布局、CSS、JS、导航或图片时，建议再本地预览：

```sh
bundle exec jekyll serve --livereload
```

重点检查：

- 首页是否显示头像、站点标题、tagline 和最新文章。
- 文章页作者卡片、文章大纲、正文图片是否正常。
- `/posts/`、`/categories/`、`/tags/` 是否可打开。
- 图片路径在 `baseurl` 下是否正确。
- 移动端布局是否没有文字或图片溢出。

## 协作注意事项

- 不要编辑 `_site/` 中的生成文件。
- 不要提交 `.bundle/`、`vendor/`、`.jekyll-cache/`、`.sass-cache/`。
- 不要无关重排 `Gemfile.lock` 或大范围改动主题覆盖样式。
- 修改已有文章时保留原有语气，除非任务明确要求重写。
- 涉及第三方服务价格、政策、可用性或日期的信息，发布前应重新核验，因为这些内容变化很快。
