import { describe, expect, it } from "vitest";
import {
  COVER_CHANNELS,
  COVER_TEMPLATES,
  BRAND_ICONS,
  createIconLayer,
  createImageLayer,
  createTextLayer,
  getBackgroundImagesByChannel,
  getTemplatesByChannel,
  updateLayer,
} from "./cover";

describe("cover editor model", () => {
  it("provides templates for Xiaohongshu and WeChat covers", () => {
    expect(COVER_CHANNELS.map((channel) => channel.id)).toEqual(["xiaohongshu", "wechat"]);
    expect(getTemplatesByChannel("xiaohongshu").length).toBeGreaterThanOrEqual(3);
    expect(getTemplatesByChannel("wechat").length).toBeGreaterThanOrEqual(3);
    expect(COVER_TEMPLATES.every((template) => template.layers.length > 0)).toBe(true);
  });

  it("provides platform-specific background images", () => {
    const xiaohongshuImages = getBackgroundImagesByChannel("xiaohongshu");
    const wechatImages = getBackgroundImagesByChannel("wechat");

    expect(xiaohongshuImages.length).toBeGreaterThanOrEqual(4);
    expect(wechatImages.length).toBeGreaterThanOrEqual(4);
    expect(xiaohongshuImages.every((image) => image.channel === "xiaohongshu")).toBe(true);
    expect(wechatImages.every((image) => image.channel === "wechat")).toBe(true);
    expect(xiaohongshuImages[0].src).toContain("/cover/template/xiaohongshu/");
    expect(wechatImages[0].src).toContain("/cover/template/wechat/");
    expect(xiaohongshuImages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "xhs-dog-and-cat",
          name: "猫狗问答纸",
          src: "/cover/template/xiaohongshu/xhs_dog_and_cat.png",
        }),
      ]),
    );
  });

  it("includes a dog and cat Xiaohongshu Q&A cover template", () => {
    const template = COVER_TEMPLATES.find((item) => item.id === "xhs-dog-and-cat-qa");

    expect(template).toMatchObject({
      name: "猫狗问答卡",
      channel: "xiaohongshu",
      backgroundImageId: "xhs-dog-and-cat",
    });
    expect(template?.layers).toHaveLength(2);
    expect(template?.layers[0]).toMatchObject({
      id: "xhs-dog-and-cat-qa-title",
      type: "text",
      text: "这个网站的作者是谁？",
      fontFamily: "rounded",
      textEffect: "shadow-yellow",
    });
    expect(template?.layers[1]).toMatchObject({
      id: "xhs-dog-and-cat-qa-subtitle",
      type: "text",
      text: "卡卡罗特AI",
      highlightEffect: "highlight-bottom-green",
    });
  });

  it("creates a default text layer with editable typography", () => {
    const layer = createTextLayer("新标题");

    expect(layer).toMatchObject({
      type: "text",
      text: "新标题",
      color: "#111111",
      fontSize: 72,
      fontFamily: "system",
      bold: true,
      italic: false,
      underline: false,
      align: "center",
      lineHeight: 1.08,
      letterSpacing: 0,
      highlightEffect: "none",
    });
    expect(layer.x).toBeGreaterThanOrEqual(0);
    expect(layer.y).toBeGreaterThanOrEqual(0);
  });

  it("creates an uploaded image layer with a visible default size", () => {
    const layer = createImageLayer("data:image/png;base64,abc", "my-cover.png");

    expect(layer).toMatchObject({
      type: "image",
      src: "data:image/png;base64,abc",
      alt: "my-cover.png",
      width: 32,
    });
    expect(layer.x).toBeGreaterThanOrEqual(0);
    expect(layer.y).toBeGreaterThanOrEqual(0);
  });

  it("updates only the matching layer", () => {
    const title = createTextLayer("标题");
    const icon = createIconLayer("openai");

    const nextLayers = updateLayer([title, icon], title.id, { color: "#ff0000", x: 12 });

    expect(nextLayers[0]).toMatchObject({ color: "#ff0000", x: 12 });
    expect(nextLayers[1]).toEqual(icon);
  });

  it("includes common AI brand icons", () => {
    const iconIds = BRAND_ICONS.map((icon) => icon.id);

    expect(iconIds).toEqual(
      expect.arrayContaining([
        "alibaba",
        "anthropic",
        "apple",
        "codex",
        "deepseek",
        "github",
        "google",
        "openai",
        "qoder",
      ]),
    );
    expect(iconIds).not.toEqual(expect.arrayContaining(["chatgpt", "claude", "gemini"]));
    expect(BRAND_ICONS.every((icon) => icon.src)).toBe(true);
    expect(BRAND_ICONS.filter((icon) => icon.src).map((icon) => icon.src)).toEqual(
      expect.arrayContaining([
        "/logo/alibaba.svg",
        "/logo/anthropic.svg",
        "/logo/apple.svg",
        "/logo/codex.svg",
        "/logo/openai.svg",
      ]),
    );
  });

  it("uses registered logo icons in cover templates", () => {
    const iconIds = new Set(BRAND_ICONS.map((icon) => icon.id));
    const templateIconIds = COVER_TEMPLATES.flatMap((template) =>
      template.layers
        .filter((layer) => layer.type === "icon")
        .map((layer) => layer.iconId),
    );

    expect(templateIconIds.every((iconId) => iconIds.has(iconId))).toBe(true);
  });
});
