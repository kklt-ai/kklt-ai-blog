import type { CoverBackgroundImage, CoverChannelId } from "./types";

export const COVER_TEMPLATE_FAVORITES_STORAGE_KEY = "xhs-cover-template-favorites";
export const COVER_BACKGROUND_FAVORITES_STORAGE_KEY = "xhs-cover-background-favorites";
export const CUSTOM_COVER_BACKGROUNDS_STORAGE_KEY = "xhs-cover-custom-backgrounds";

export type FavoriteTimes = Record<string, number>;
export type CustomCoverBackgroundImage = CoverBackgroundImage & { custom: true };

type CreateCustomBackgroundImageOptions = {
  channelId: CoverChannelId;
  name: string;
  src: string;
};

function customBackgroundId(channelId: CoverChannelId) {
  return `custom-background-${channelId}-${Date.now().toString(36)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFavoriteTimes(value: unknown): value is FavoriteTimes {
  if (!isRecord(value)) return false;
  return Object.values(value).every((time) => typeof time === "number" && Number.isFinite(time));
}

function isCustomCoverBackgroundImage(value: unknown): value is CustomCoverBackgroundImage {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.channel === "xiaohongshu" || value.channel === "wechat") &&
    typeof value.src === "string" &&
    value.custom === true
  );
}

export function loadFavoriteTimes(storage: Storage, storageKey: string): FavoriteTimes {
  const rawValue = storage.getItem(storageKey);
  if (!rawValue) return {};

  try {
    const parsedValue = JSON.parse(rawValue);
    return isFavoriteTimes(parsedValue) ? parsedValue : {};
  } catch {
    return {};
  }
}

function saveFavoriteTimes(storage: Storage, storageKey: string, favoriteTimes: FavoriteTimes) {
  storage.setItem(storageKey, JSON.stringify(favoriteTimes));
}

export function toggleFavoriteTime(
  storage: Storage,
  storageKey: string,
  itemId: string,
): FavoriteTimes {
  const favoriteTimes = loadFavoriteTimes(storage, storageKey);
  const nextFavoriteTimes = { ...favoriteTimes };
  if (nextFavoriteTimes[itemId]) {
    delete nextFavoriteTimes[itemId];
  } else {
    nextFavoriteTimes[itemId] = Date.now();
  }
  saveFavoriteTimes(storage, storageKey, nextFavoriteTimes);
  return nextFavoriteTimes;
}

export function deleteFavoriteTime(
  storage: Storage,
  storageKey: string,
  itemId: string,
): FavoriteTimes {
  const favoriteTimes = loadFavoriteTimes(storage, storageKey);
  const nextFavoriteTimes = { ...favoriteTimes };
  delete nextFavoriteTimes[itemId];
  saveFavoriteTimes(storage, storageKey, nextFavoriteTimes);
  return nextFavoriteTimes;
}

export function sortByFavoriteTime<T extends { id: string }>(
  items: T[],
  favoriteTimes: FavoriteTimes,
): T[] {
  return [...items].sort((first, second) => {
    const firstFavoriteTime = favoriteTimes[first.id] ?? 0;
    const secondFavoriteTime = favoriteTimes[second.id] ?? 0;
    if (firstFavoriteTime || secondFavoriteTime) {
      return secondFavoriteTime - firstFavoriteTime;
    }
    return 0;
  });
}

export function createCustomBackgroundImage({
  channelId,
  name,
  src,
}: CreateCustomBackgroundImageOptions): CustomCoverBackgroundImage {
  return {
    id: customBackgroundId(channelId),
    name,
    channel: channelId,
    src,
    custom: true,
  };
}

export function loadCustomBackgroundImages(storage: Storage): CustomCoverBackgroundImage[] {
  const rawValue = storage.getItem(CUSTOM_COVER_BACKGROUNDS_STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];
    return parsedValue.filter(isCustomCoverBackgroundImage);
  } catch {
    return [];
  }
}

function saveCustomBackgroundImages(
  storage: Storage,
  backgrounds: CustomCoverBackgroundImage[],
) {
  storage.setItem(CUSTOM_COVER_BACKGROUNDS_STORAGE_KEY, JSON.stringify(backgrounds));
}

export function saveCustomBackgroundImage(
  storage: Storage,
  background: CustomCoverBackgroundImage,
): CustomCoverBackgroundImage[] {
  const backgrounds = loadCustomBackgroundImages(storage);
  const nextBackgrounds = [...backgrounds, background];
  saveCustomBackgroundImages(storage, nextBackgrounds);
  return nextBackgrounds;
}

export function deleteCustomBackgroundImage(
  storage: Storage,
  backgroundId: string,
): CustomCoverBackgroundImage[] {
  const nextBackgrounds = loadCustomBackgroundImages(storage).filter(
    (background) => background.id !== backgroundId,
  );
  saveCustomBackgroundImages(storage, nextBackgrounds);
  return nextBackgrounds;
}
