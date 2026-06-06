# 小红书 Markdown 图片工具

一个纯前端 Next.js 工具，包含 Markdown 多页图片生成和封面制作两个工作区。

## 功能

### Markdown 图片

- Markdown 编辑和 `.md` 上传
- 自动分页和 `-------` 手动分割
- 多主题预览
- 自定义图片宽高
- 当前页 PNG 导出或全部页面 ZIP 打包
- 本地图片上传，使用 `local-image://...` 短引用保持 Markdown 轻量

### 封面制作

- 小红书和公众号封面尺寸
- 模板、文字图层和品牌图标
- 独立封面 PNG 导出

## 本地图片存储

本项目使用浏览器的 IndexedDB 保存用户上传的本地图片。IndexedDB 是浏览器内置的本地数据库，适合存放图片这类比普通配置更大的数据。图片不会上传到服务器或 Vercel，数据只保存在当前浏览器、当前网站域名下。

上传图片后，左侧 Markdown 编辑器只插入短引用，例如：

```md
![cover photo](local-image://cover-photo-...)
```

真实的 `data:image/...base64,...` 数据会保存到 IndexedDB。预览和导出时，应用会根据 `local-image://...` 引用从 IndexedDB 读取图片，再渲染到页面中。

相关代码位置：

- `src/md-image/lib/localImages.ts`：IndexedDB 图片库，负责保存图片、读取图片引用、提取当前 Markdown 使用到的图片、清理未引用旧图片。
- `src/md-image/components/EditorPanel.tsx`：图片上传入口。读取本地文件后调用图片库保存，只把 `local-image://...` 短引用插入 Markdown。
- `src/md-image/MarkdownImageApp.tsx`：连接编辑器、预览和图片库。页面打开后会异步清理未被当前 Markdown 引用的旧图片。
- `src/md-image/lib/images.ts` 和 `src/md-image/components/RenderedPage.tsx`：预览渲染时把 `local-image://...` 解析成实际图片数据。

## 导出

两种工作区各自维护导出逻辑：

- `src/md-image/lib/export.ts`：Markdown 图片的单页 PNG、全部页面 ZIP 和日期文件名。
- `src/cover/lib/export.ts`：封面制作的单张 PNG 导出和封面文件名。

## 开发

```bash
npm install
npm run dev
```

## 验证

```bash
npm test
npm run build
```

## 部署

导入 Vercel 后使用默认 Next.js 配置即可部署。
