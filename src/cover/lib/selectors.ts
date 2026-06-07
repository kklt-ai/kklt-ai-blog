import { BRAND_ICONS } from "./brandIcons";
import { COVER_BACKGROUND_IMAGES } from "./backgroundImages";
import { COVER_CHANNELS } from "./channels";
import { COVER_TEMPLATES } from "./templates";
import type { BrandIconId, CoverChannelId, CoverLayer, CoverTemplate } from "./types";

export function getChannel(channelId: CoverChannelId) {
  return COVER_CHANNELS.find((channel) => channel.id === channelId) ?? COVER_CHANNELS[0];
}

export function getTemplatesByChannel(channelId: CoverChannelId) {
  return COVER_TEMPLATES.filter((template) => template.channel === channelId);
}

export function getBackgroundImagesByChannel(channelId: CoverChannelId) {
  return COVER_BACKGROUND_IMAGES.filter((image) => image.channel === channelId);
}

export function cloneTemplateLayers(template: CoverTemplate): CoverLayer[] {
  return template.layers.map((layer) => ({ ...layer }));
}

export function findBrandIcon(iconId: BrandIconId) {
  return BRAND_ICONS.find((icon) => icon.id === iconId) ?? BRAND_ICONS[0];
}
