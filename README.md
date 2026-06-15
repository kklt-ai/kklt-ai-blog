# 卡卡罗特AI Vibe Coding 作品集

一个基于 Next.js 的浏览器端 AI 创作工具作品集。首页集中展示卡卡罗特AI的 Vibe Coding 项目，目前包含 Markdown 图片生成和自媒体封面设计两个工作区。

## 项目入口

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 作品集首页 | 展示项目卡片、公众号入口、GitHub 链接和中英文切换 |
| `/md-card` | Markdown 图片 | 将 Markdown 排版为适合小红书发布的多页 PNG 图片 |
| `/cover` | 自媒体封面 | 为小红书、公众号等平台设计并导出封面图片 |

## 作品集首页

首页是整个项目的统一入口，采用卡卡罗特AI品牌视觉，提供：

- 卡卡罗特AI与 Vibe Coding 作品介绍
- Markdown 图片和自媒体封面的项目卡片
- 中文、英文界面切换
- GitHub 与公众号入口
- 响应式桌面端和移动端布局
- 飞天背景、打字动画和交互式水墨遮罩效果

首页主要代码位于 `src/home/`，路由入口为 `src/app/page.tsx`。

## Markdown 图片

Markdown 图片工作区用于把文章快速制作成适合内容平台发布的多页图片。

- Markdown 编辑和 `.md` 文件上传
- 标题、加粗、列表、引用、代码、表格、分隔线和图片工具栏
- 使用三个或更多连续短横线手动分页
- 根据渲染高度自动分页
- 多种主题、字体、字号和排版设置
- 自定义宽高、固定尺寸和自动高度模式
- 作者头像、名称和页码水印
- 当前页面 PNG 下载
- 全部页面 ZIP 打包下载
- 本地图片上传与远程图片渲染

### 本地图片存储

上传到 Markdown 的本地图片保存在浏览器 IndexedDB 中，不会上传到服务器。编辑器只在 Markdown 中插入轻量引用：

```md
![cover photo](local-image://cover-photo-...)
```

预览和导出时，应用会读取 IndexedDB 中的真实图片数据，并将 `local-image://...` 引用解析为可渲染的图片。

## 自媒体封面

封面工作区用于制作小红书和微信公众号等平台的封面图片。

- 平台尺寸和频道切换
- 预设模板与自定义模板
- 多画板创建、切换和删除
- 文字、图片和品牌图标图层
- 字体、颜色、描边、高亮和文字效果设置
- 预设背景、自定义背景和收藏排序
- 当前模板保存与模板配置复制
- 图层拖动、缩放与画布对齐辅助线
- 浏览器本地持久化
- 独立 PNG 导出

封面画板最多可保存 10 个。画板、自定义模板和背景配置保存在当前浏览器的 `localStorage` 中。

## 数据与隐私

项目以浏览器端处理为主：

- Markdown 草稿和界面设置保存在 `localStorage`
- Markdown 本地图片保存在 IndexedDB
- 封面画板、模板和自定义背景保存在 `localStorage`
- 图片排版和 PNG 导出在浏览器中完成

清除当前网站的浏览器数据会同时删除这些本地内容。

## 技术栈

- Next.js 14 App Router
- React 18 与 TypeScript
- Tailwind CSS
- unified、remark-parse 与 remark-gfm
- html-to-image
- lucide-react
- Vitest、jsdom 与 Testing Library

## 本地开发

要求安装支持 Next.js 14 的 Node.js 版本，推荐使用 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建和类型检查
npm start          # 启动生产服务器
npm test           # 运行 Vitest 测试
npm run test:watch # 监听模式运行测试
npm run lint       # 运行 Next.js ESLint
```

## 目录结构

```text
src/
├── app/              # App Router 页面、布局和图片 API
├── home/             # 作品集首页
├── md-image/         # Markdown 图片工作区
├── cover/            # 自媒体封面工作区
└── test/             # Vitest 测试环境
```

## 部署

项目可以使用默认 Next.js 配置部署到 Vercel，也可以执行 `npm run build` 后部署到其他支持 Next.js 的 Node.js 环境。

浏览器本地数据按域名隔离。更换部署域名后，旧域名下保存的草稿、图片和封面数据不会自动迁移。
