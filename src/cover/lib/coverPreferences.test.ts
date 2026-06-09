import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CoverBackgroundImage, CoverTemplate } from "./cover";
import {
  COVER_BACKGROUND_FAVORITES_STORAGE_KEY,
  COVER_TEMPLATE_FAVORITES_STORAGE_KEY,
  CUSTOM_COVER_BACKGROUNDS_STORAGE_KEY,
  createCustomBackgroundImage,
  deleteCustomBackgroundImage,
  deleteFavoriteTime,
  loadCustomBackgroundImages,
  loadFavoriteTimes,
  saveCustomBackgroundImage,
  sortByFavoriteTime,
  toggleFavoriteTime,
} from "./coverPreferences";

const templates = [
  { id: "preset-one", name: "预设一" },
  { id: "preset-two", name: "预设二" },
  { id: "custom-one", name: "自定义一" },
] as CoverTemplate[];

describe("cover preferences", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.setSystemTime(new Date("2026-06-07T03:20:00.000Z"));
  });

  it("sorts favorited items by newest favorite time before regular items", () => {
    const favoriteTimes = {
      "preset-one": 10,
      "custom-one": 20,
    };

    expect(sortByFavoriteTime(templates, favoriteTimes).map((template) => template.id)).toEqual([
      "custom-one",
      "preset-one",
      "preset-two",
    ]);
  });

  it("toggles favorite timestamps in browser storage", () => {
    const firstFavoriteTimes = toggleFavoriteTime(
      localStorage,
      COVER_TEMPLATE_FAVORITES_STORAGE_KEY,
      "preset-one",
    );

    expect(firstFavoriteTimes).toEqual({ "preset-one": 1780802400000 });
    expect(loadFavoriteTimes(localStorage, COVER_TEMPLATE_FAVORITES_STORAGE_KEY)).toEqual(
      firstFavoriteTimes,
    );

    const secondFavoriteTimes = toggleFavoriteTime(
      localStorage,
      COVER_TEMPLATE_FAVORITES_STORAGE_KEY,
      "preset-one",
    );

    expect(secondFavoriteTimes).toEqual({});
  });

  it("removes a deleted item from favorite storage", () => {
    localStorage.setItem(
      COVER_BACKGROUND_FAVORITES_STORAGE_KEY,
      JSON.stringify({ "custom-background": 30, "preset-background": 20 }),
    );

    expect(
      deleteFavoriteTime(
        localStorage,
        COVER_BACKGROUND_FAVORITES_STORAGE_KEY,
        "custom-background",
      ),
    ).toEqual({ "preset-background": 20 });
  });

  it("saves, loads, and deletes custom background images", () => {
    const background = createCustomBackgroundImage({
      channelId: "xiaohongshu",
      name: "my-bg.png",
      src: "data:image/png;base64,abc",
    });

    expect(background).toEqual({
      id: "custom-background-xiaohongshu-mq37rpxc",
      name: "my-bg.png",
      channel: "xiaohongshu",
      src: "data:image/png;base64,abc",
      custom: true,
    });

    saveCustomBackgroundImage(localStorage, background);

    expect(loadCustomBackgroundImages(localStorage)).toEqual([background]);
    expect(localStorage.getItem(CUSTOM_COVER_BACKGROUNDS_STORAGE_KEY)).toContain(
      "custom-background-xiaohongshu-mq37rpxc",
    );

    expect(deleteCustomBackgroundImage(localStorage, background.id)).toEqual([]);
  });

  it("ignores invalid stored custom background data", () => {
    localStorage.setItem(
      CUSTOM_COVER_BACKGROUNDS_STORAGE_KEY,
      JSON.stringify([
        {
          id: "custom-background-xiaohongshu-valid",
          name: "valid",
          channel: "xiaohongshu",
          src: "data:image/png;base64,abc",
          custom: true,
        },
        {
          id: "invalid",
          name: "invalid",
          channel: "mastodon",
          src: "data:image/png;base64,abc",
          custom: true,
        },
      ]),
    );

    expect(loadCustomBackgroundImages(localStorage)).toEqual([
      expect.objectContaining({ id: "custom-background-xiaohongshu-valid" }),
    ] satisfies Partial<CoverBackgroundImage>[]);
  });
});
