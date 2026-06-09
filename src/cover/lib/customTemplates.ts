import type { CoverChannelId, CoverLayer, CoverTemplate } from "./cover";

export const CUSTOM_COVER_TEMPLATES_STORAGE_KEY = "xhs-cover-custom-templates";

export type CoverTemplateBackgroundSelection =
  | { kind: "image"; id: string; src: string }
  | { kind: "color"; id: string; className: string };

type CreateCustomTemplateOptions = {
  channelId: CoverChannelId;
  layers: CoverLayer[];
  selectedBackground: CoverTemplateBackgroundSelection;
  templateNumber: number;
};

function customTemplateId(channelId: CoverChannelId) {
  return `custom-${channelId}-${Date.now().toString(36)}`;
}

function cloneLayerForTemplate(layer: CoverLayer, templateId: string, index: number): CoverLayer {
  const id = `${templateId}-${layer.type}-${index + 1}`;
  if (layer.type === "text") {
    return { ...layer, id };
  }
  return { ...layer, id };
}

function templateFingerprint(template: CoverTemplate) {
  return JSON.stringify({
    channel: template.channel,
    backgroundClassName: template.backgroundClassName,
    backgroundImageId: template.backgroundImageId ?? null,
    layers: template.layers.map((layer) => {
      const { id: _id, ...layerWithoutId } = layer;
      return layerWithoutId;
    }),
  });
}

function isCoverTemplate(value: unknown): value is CoverTemplate {
  if (!value || typeof value !== "object") return false;
  const template = value as Partial<CoverTemplate>;
  return (
    typeof template.id === "string" &&
    typeof template.name === "string" &&
    (template.channel === "xiaohongshu" || template.channel === "wechat") &&
    typeof template.description === "string" &&
    typeof template.backgroundClassName === "string" &&
    Array.isArray(template.layers)
  );
}

export function createCustomTemplateFromCover({
  channelId,
  layers,
  selectedBackground,
  templateNumber,
}: CreateCustomTemplateOptions): CoverTemplate {
  const id = customTemplateId(channelId);
  return {
    id,
    name: `我的模板 ${templateNumber}`,
    channel: channelId,
    description: "从当前封面保存",
    backgroundClassName:
      selectedBackground.kind === "color" ? selectedBackground.className : "bg-white",
    ...(selectedBackground.kind === "image" ? { backgroundImageId: selectedBackground.id } : {}),
    layers: layers.map((layer, index) => cloneLayerForTemplate(layer, id, index)),
  };
}

export function loadCustomTemplates(storage: Storage): CoverTemplate[] {
  const rawValue = storage.getItem(CUSTOM_COVER_TEMPLATES_STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];
    return parsedValue.filter(isCoverTemplate);
  } catch {
    return [];
  }
}

export function saveCustomTemplate(storage: Storage, template: CoverTemplate) {
  const templates = loadCustomTemplates(storage);
  storage.setItem(
    CUSTOM_COVER_TEMPLATES_STORAGE_KEY,
    JSON.stringify([...templates, template]),
  );
}

export function deleteCustomTemplate(storage: Storage, templateId: string) {
  const templates = loadCustomTemplates(storage).filter((template) => template.id !== templateId);
  storage.setItem(CUSTOM_COVER_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  return templates;
}

export function findDuplicateTemplate(template: CoverTemplate, templates: CoverTemplate[]) {
  const currentFingerprint = templateFingerprint(template);
  return templates.find(
    (storedTemplate) => templateFingerprint(storedTemplate) === currentFingerprint,
  );
}

export function templateToConfigText(template: CoverTemplate) {
  return JSON.stringify(template, null, 2);
}
