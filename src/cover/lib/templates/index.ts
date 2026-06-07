import { WECHAT_COVER_TEMPLATES } from "./wechat";
import { XIAOHONGSHU_COVER_TEMPLATES } from "./xiaohongshu";

export { WECHAT_COVER_TEMPLATES } from "./wechat";
export { XIAOHONGSHU_COVER_TEMPLATES } from "./xiaohongshu";

export const COVER_TEMPLATES = [
  ...XIAOHONGSHU_COVER_TEMPLATES,
  ...WECHAT_COVER_TEMPLATES,
];
