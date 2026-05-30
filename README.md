# 小红书 Markdown 排版工具

一个纯前端工具，把 Markdown 转成适合小红书发布的多页 PNG 图片。

## 功能

- Markdown 编辑和 `.md` 上传
- 自动分页和 `-------` 手动分割
- 多主题预览
- 自定义图片宽高
- 当前页或全部页面 PNG 导出

## 本地图片存储

本项目使用浏览器的 IndexedDB 保存用户上传的本地图片。IndexedDB 是浏览器内置的本地数据库，适合存放图片这类比普通配置更大的数据。图片不会上传到服务器或 Vercel，数据只保存在当前浏览器、当前网站域名下。

上传图片后，左侧 Markdown 编辑器只插入短引用，例如：

```md
![cover photo](local-image://cover-photo-...)
```

真实的 `data:image/...base64,...` 数据会保存到 IndexedDB。预览和导出时，应用会根据 `local-image://...` 引用从 IndexedDB 读取图片，再渲染到页面中。

相关代码位置：

- `src/lib/localImages.ts`：IndexedDB 图片库，负责保存图片、读取图片引用、提取当前 Markdown 使用到的图片、清理未引用旧图片。
- `src/components/EditorPanel.tsx`：图片上传入口。读取本地文件后调用图片库保存，只把 `local-image://...` 短引用插入 Markdown。
- `src/app/page.tsx`：连接编辑器、预览和图片库。页面打开后会异步清理未被当前 Markdown 引用的旧图片。
- `src/lib/images.ts` 和 `src/components/RenderedPage.tsx`：预览渲染时把 `local-image://...` 解析成实际图片数据。

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
