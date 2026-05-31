import type { WatermarkSettings } from "./types";

export const DEFAULT_WATERMARK_AUTHOR_NAME = "卡卡罗特AI";
export const DEFAULT_WATERMARK_AVATAR_SRC = "/watermark-avatar.jpg";

export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
  enabled: true,
  authorName: DEFAULT_WATERMARK_AUTHOR_NAME,
  avatarSrc: DEFAULT_WATERMARK_AVATAR_SRC,
};

export function normalizeWatermarkSettings(value: unknown): WatermarkSettings {
  if (!value || typeof value !== "object") return DEFAULT_WATERMARK_SETTINGS;

  const record = value as Partial<WatermarkSettings>;

  return {
    enabled:
      typeof record.enabled === "boolean"
        ? record.enabled
        : DEFAULT_WATERMARK_SETTINGS.enabled,
    authorName:
      typeof record.authorName === "string"
        ? record.authorName
        : DEFAULT_WATERMARK_SETTINGS.authorName,
    avatarSrc:
      typeof record.avatarSrc === "string" || record.avatarSrc === null
        ? record.avatarSrc
        : DEFAULT_WATERMARK_SETTINGS.avatarSrc,
  };
}
