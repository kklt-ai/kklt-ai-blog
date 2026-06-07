import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CoverLayer } from "./cover";
import {
  CUSTOM_COVER_TEMPLATES_STORAGE_KEY,
  createCustomTemplateFromCover,
  findDuplicateTemplate,
  loadCustomTemplates,
  saveCustomTemplate,
  templateToConfigText,
} from "./customTemplates";

const sampleLayers: CoverLayer[] = [
  {
    id: "text-current",
    type: "text",
    text: "自定义标题",
    x: 12,
    y: 22,
    width: 76,
    fontSize: 88,
    color: "#111111",
    fontFamily: "rounded",
    bold: true,
    italic: false,
    underline: false,
    align: "center",
    lineHeight: 1.08,
    letterSpacing: 0,
    textEffect: "shadow-yellow",
    highlightEffect: "highlight-bottom-green",
  },
  {
    id: "icon-current",
    type: "icon",
    iconId: "codex",
    x: 72,
    y: 12,
    size: 13,
  },
];

describe("custom cover templates", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.setSystemTime(new Date("2026-06-07T03:20:00.000Z"));
  });

  it("creates a reusable template from the current cover with a color background", () => {
    const template = createCustomTemplateFromCover({
      channelId: "xiaohongshu",
      layers: sampleLayers,
      selectedBackground: {
        kind: "color",
        id: "draft-background",
        className: "bg-[linear-gradient(135deg,#ffffff_0%,#fde68a_100%)]",
      },
      templateNumber: 3,
    });

    expect(template).toMatchObject({
      id: "custom-xiaohongshu-mq37rpxc",
      name: "我的模板 3",
      channel: "xiaohongshu",
      description: "从当前封面保存",
      backgroundClassName: "bg-[linear-gradient(135deg,#ffffff_0%,#fde68a_100%)]",
    });
    expect(template.backgroundImageId).toBeUndefined();
    expect(template.layers).toEqual([
      expect.objectContaining({
        id: "custom-xiaohongshu-mq37rpxc-text-1",
        type: "text",
        text: "自定义标题",
        textEffect: "shadow-yellow",
        highlightEffect: "highlight-bottom-green",
      }),
      expect.objectContaining({
        id: "custom-xiaohongshu-mq37rpxc-icon-2",
        type: "icon",
        iconId: "codex",
      }),
    ]);
  });

  it("creates a reusable template from the current cover with a registered image background", () => {
    const template = createCustomTemplateFromCover({
      channelId: "xiaohongshu",
      layers: sampleLayers,
      selectedBackground: {
        kind: "image",
        id: "xhs-dog-and-cat",
        src: "/cover/template/xiaohongshu/xhs_dog_and_cat.png",
      },
      templateNumber: 1,
    });

    expect(template).toMatchObject({
      id: "custom-xiaohongshu-mq37rpxc",
      backgroundClassName: "bg-white",
      backgroundImageId: "xhs-dog-and-cat",
    });
  });

  it("saves and loads custom templates from browser storage", () => {
    const firstTemplate = createCustomTemplateFromCover({
      channelId: "xiaohongshu",
      layers: sampleLayers,
      selectedBackground: { kind: "color", id: "one", className: "bg-white" },
      templateNumber: 1,
    });

    saveCustomTemplate(localStorage, firstTemplate);

    expect(loadCustomTemplates(localStorage)).toEqual([firstTemplate]);
    expect(localStorage.getItem(CUSTOM_COVER_TEMPLATES_STORAGE_KEY)).toContain(
      "custom-xiaohongshu-mq37rpxc",
    );
  });

  it("detects duplicate templates by reusable cover content instead of generated ids", () => {
    const firstTemplate = createCustomTemplateFromCover({
      channelId: "xiaohongshu",
      layers: sampleLayers,
      selectedBackground: { kind: "color", id: "one", className: "bg-white" },
      templateNumber: 1,
    });
    const sameCoverWithDifferentIds = {
      ...firstTemplate,
      id: "custom-xiaohongshu-other",
      name: "另一个名字",
      layers: firstTemplate.layers.map((layer) => ({
        ...layer,
        id: `other-${layer.id}`,
      })),
    };
    const differentCover = {
      ...firstTemplate,
      id: "custom-xiaohongshu-different",
      layers: firstTemplate.layers.map((layer) =>
        layer.type === "text" ? { ...layer, text: "不同标题" } : layer,
      ),
    };

    expect(findDuplicateTemplate(firstTemplate, [sameCoverWithDifferentIds])).toEqual(
      sameCoverWithDifferentIds,
    );
    expect(findDuplicateTemplate(firstTemplate, [differentCover])).toBeUndefined();
  });

  it("ignores invalid stored custom template data", () => {
    localStorage.setItem(CUSTOM_COVER_TEMPLATES_STORAGE_KEY, "{bad json");

    expect(loadCustomTemplates(localStorage)).toEqual([]);
  });

  it("generates a copyable preset template configuration", () => {
    const template = createCustomTemplateFromCover({
      channelId: "xiaohongshu",
      layers: sampleLayers,
      selectedBackground: { kind: "color", id: "one", className: "bg-white" },
      templateNumber: 1,
    });

    expect(templateToConfigText(template)).toBe(`{
  "id": "custom-xiaohongshu-mq37rpxc",
  "name": "我的模板 1",
  "channel": "xiaohongshu",
  "description": "从当前封面保存",
  "backgroundClassName": "bg-white",
  "layers": [
    {
      "id": "custom-xiaohongshu-mq37rpxc-text-1",
      "type": "text",
      "text": "自定义标题",
      "x": 12,
      "y": 22,
      "width": 76,
      "fontSize": 88,
      "color": "#111111",
      "fontFamily": "rounded",
      "bold": true,
      "italic": false,
      "underline": false,
      "align": "center",
      "lineHeight": 1.08,
      "letterSpacing": 0,
      "textEffect": "shadow-yellow",
      "highlightEffect": "highlight-bottom-green"
    },
    {
      "id": "custom-xiaohongshu-mq37rpxc-icon-2",
      "type": "icon",
      "iconId": "codex",
      "x": 72,
      "y": 12,
      "size": 13
    }
  ]
}`);
  });
});
