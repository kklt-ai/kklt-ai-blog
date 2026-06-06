import { describe, expect, it } from "vitest";
import {
  COVER_CHANNELS,
  COVER_TEMPLATES,
  BRAND_ICONS,
  createIconLayer,
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

    expect(xiaohongshuImages.length).toBeGreaterThanOrEqual(3);
    expect(wechatImages.length).toBeGreaterThanOrEqual(4);
    expect(xiaohongshuImages.every((image) => image.channel === "xiaohongshu")).toBe(true);
    expect(wechatImages.every((image) => image.channel === "wechat")).toBe(true);
    expect(xiaohongshuImages[0].src).toContain("/cover/template/xiaohongshu/");
    expect(wechatImages[0].src).toContain("/cover/template/wechat/");
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
    expect(BRAND_ICONS.map((icon) => icon.id)).toEqual([
      "codex",
      "openai",
      "anthropic",
      "chatgpt",
      "claude",
      "gemini",
    ]);
  });
});
