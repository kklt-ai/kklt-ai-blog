# Markdown 图片完整显示配置设计

## 目标

Markdown 图片在中间预览和 PNG 导出中默认等比完整显示，不再因固定图片区域使用 `cover` 而被裁剪。右侧设置面板提供一个可选开关，让用户在需要时恢复裁剪填充效果。

## 交互与默认行为

- 在右侧“设置”页签的“图片尺寸”区域增加复选框“裁剪图片以填满 460px 区域”。
- 复选框默认不勾选。图片保持现有 `460px` 最大高度，并使用 `contain` 完整显示；图片比例与区域不一致时允许留白。
- 勾选后使用 `cover`，图片填满显示区域，超出部分允许裁剪。
- 该选项同时作用于中间预览和 PNG/ZIP 导出，不影响作者水印头像。

## 状态与渲染

- `MarkdownImageApp` 增加布尔状态 `cropImages`，默认值为 `false`。
- 将 `cropImages` 写入现有 `xhs-md-image-tool` 本地草稿，并在恢复草稿时读取。旧草稿缺少该字段时保持默认的完整显示行为。
- 状态通过 `PreviewPanel` 传给 `RenderedPage`。预览节点和隐藏导出节点传入相同配置。
- `RenderedPage` 在启用裁剪时为页面根节点添加语义类名。基础 Markdown 图片样式使用 `object-fit: contain`；该类名下覆盖为 `object-fit: cover`。

## 测试

- `SettingsPanel.test.tsx` 验证复选框默认未勾选，并在点击时触发 `true` 回调。
- `styles.test.ts` 验证 Markdown 图片默认使用 `contain`，裁剪类覆盖为 `cover`，且作者头像样式不受影响。
- `RenderedPage.test.tsx` 验证仅在启用裁剪时添加裁剪类名。
- `PreviewPanel.test.tsx` 验证预览节点和隐藏导出节点使用相同的裁剪配置。
- 新增应用级测试，验证旧草稿默认完整显示，并验证用户启用裁剪后 `cropImages: true` 会写入现有本地草稿。
- 先运行新增测试并确认其因当前行为缺失而失败，再实现最小改动。完成后运行相关 Vitest 测试和完整 `npm test`。

## 非目标

- 不修改 `460px` 最大高度。
- 不增加自定义图片高度或更多适配模式。
- 不改变 Markdown 解析、分页估算、主题配置或图片上传方式。
- 不修改封面编辑工作区。
