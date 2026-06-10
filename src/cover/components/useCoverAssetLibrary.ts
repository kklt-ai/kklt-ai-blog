import { useEffect, useMemo, useState } from "react";
import {
  type CoverChannelId,
  type CoverTemplate,
  getBackgroundImagesByChannel,
  getTemplatesByChannel,
} from "@/cover/lib/cover";
import {
  createCustomTemplateFromCover,
  deleteCustomTemplate,
  findDuplicateTemplate,
  loadCustomTemplates,
  saveCustomTemplate,
} from "@/cover/lib/customTemplates";
import {
  COVER_BACKGROUND_FAVORITES_STORAGE_KEY,
  COVER_TEMPLATE_FAVORITES_STORAGE_KEY,
  createCustomBackgroundImage,
  deleteCustomBackgroundImage,
  deleteFavoriteTime,
  loadCustomBackgroundImages,
  loadFavoriteTimes,
  saveCustomBackgroundImage,
  sortByFavoriteTime,
  toggleFavoriteTime,
  type CustomCoverBackgroundImage,
  type FavoriteTimes,
} from "@/cover/lib/coverPreferences";
import type { CoverBackgroundSelection } from "./coverEditorTypes";

type CreateTemplateOptions = {
  channelId: CoverChannelId;
  layers: Parameters<typeof createCustomTemplateFromCover>[0]["layers"];
  selectedBackground: CoverBackgroundSelection;
};

export function useCoverAssetLibrary(channelId: CoverChannelId) {
  const [customTemplates, setCustomTemplates] = useState<CoverTemplate[]>([]);
  const [templateFavoriteTimes, setTemplateFavoriteTimes] = useState<FavoriteTimes>({});
  const [customBackgroundImages, setCustomBackgroundImages] = useState<
    CustomCoverBackgroundImage[]
  >([]);
  const [backgroundFavoriteTimes, setBackgroundFavoriteTimes] = useState<FavoriteTimes>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCustomTemplates(loadCustomTemplates(window.localStorage));
    setTemplateFavoriteTimes(
      loadFavoriteTimes(window.localStorage, COVER_TEMPLATE_FAVORITES_STORAGE_KEY),
    );
    setCustomBackgroundImages(loadCustomBackgroundImages(window.localStorage));
    setBackgroundFavoriteTimes(
      loadFavoriteTimes(window.localStorage, COVER_BACKGROUND_FAVORITES_STORAGE_KEY),
    );
  }, []);
  const presetTemplates = useMemo(() => getTemplatesByChannel(channelId), [channelId]);
  const templates = useMemo(
    () =>
      sortByFavoriteTime(
        [
          ...presetTemplates,
          ...customTemplates.filter((template) => template.channel === channelId),
        ],
        templateFavoriteTimes,
      ),
    [channelId, customTemplates, presetTemplates, templateFavoriteTimes],
  );
  const presetBackgroundImages = useMemo(
    () => getBackgroundImagesByChannel(channelId),
    [channelId],
  );
  const backgroundImages = useMemo(
    () =>
      sortByFavoriteTime(
        [
          ...presetBackgroundImages,
          ...customBackgroundImages.filter((background) => background.channel === channelId),
        ],
        backgroundFavoriteTimes,
      ),
    [backgroundFavoriteTimes, channelId, customBackgroundImages, presetBackgroundImages],
  );

  const getTemplatesForChannel = (
    nextChannelId: CoverChannelId,
    nextCustomTemplates = customTemplates,
    nextTemplateFavoriteTimes = templateFavoriteTimes,
  ) =>
    sortByFavoriteTime(
      [
        ...getTemplatesByChannel(nextChannelId),
        ...nextCustomTemplates.filter((template) => template.channel === nextChannelId),
      ],
      nextTemplateFavoriteTimes,
    );

  const getBackgroundsForChannel = (
    nextChannelId: CoverChannelId,
    nextCustomBackgroundImages: CustomCoverBackgroundImage[] = customBackgroundImages,
    nextBackgroundFavoriteTimes = backgroundFavoriteTimes,
  ) =>
    sortByFavoriteTime(
      [
        ...getBackgroundImagesByChannel(nextChannelId),
        ...nextCustomBackgroundImages.filter((background) => background.channel === nextChannelId),
      ],
      nextBackgroundFavoriteTimes,
    );

  const createCurrentTemplateSnapshot = ({
    channelId: nextChannelId,
    layers,
    selectedBackground,
  }: CreateTemplateOptions) =>
    createCustomTemplateFromCover({
      channelId: nextChannelId,
      layers,
      selectedBackground,
      templateNumber: customTemplates.length + 1,
    });

  const saveTemplate = (template: CoverTemplate) => {
    if (typeof window !== "undefined") {
      saveCustomTemplate(window.localStorage, template);
    }
    const nextCustomTemplates = [...customTemplates, template];
    setCustomTemplates(nextCustomTemplates);
    return nextCustomTemplates;
  };

  const removeTemplate = (templateId: string) => {
    if (typeof window === "undefined") {
      return { nextCustomTemplates: customTemplates, nextFavoriteTimes: templateFavoriteTimes };
    }
    const nextCustomTemplates = deleteCustomTemplate(window.localStorage, templateId);
    const nextFavoriteTimes = deleteFavoriteTime(
      window.localStorage,
      COVER_TEMPLATE_FAVORITES_STORAGE_KEY,
      templateId,
    );
    setCustomTemplates(nextCustomTemplates);
    setTemplateFavoriteTimes(nextFavoriteTimes);
    return { nextCustomTemplates, nextFavoriteTimes };
  };

  const toggleTemplateFavorite = (templateId: string) => {
    if (typeof window === "undefined") return;
    setTemplateFavoriteTimes(
      toggleFavoriteTime(window.localStorage, COVER_TEMPLATE_FAVORITES_STORAGE_KEY, templateId),
    );
  };

  const toggleBackgroundFavorite = (backgroundId: string) => {
    if (typeof window === "undefined") return;
    setBackgroundFavoriteTimes(
      toggleFavoriteTime(
        window.localStorage,
        COVER_BACKGROUND_FAVORITES_STORAGE_KEY,
        backgroundId,
      ),
    );
  };

  const removeBackground = (backgroundId: string) => {
    if (typeof window === "undefined") {
      return { nextCustomBackgroundImages: customBackgroundImages, nextFavoriteTimes: backgroundFavoriteTimes };
    }
    const nextCustomBackgroundImages = deleteCustomBackgroundImage(
      window.localStorage,
      backgroundId,
    );
    const nextFavoriteTimes = deleteFavoriteTime(
      window.localStorage,
      COVER_BACKGROUND_FAVORITES_STORAGE_KEY,
      backgroundId,
    );
    setCustomBackgroundImages(nextCustomBackgroundImages);
    setBackgroundFavoriteTimes(nextFavoriteTimes);
    return { nextCustomBackgroundImages, nextFavoriteTimes };
  };

  const saveUploadedBackground = (
    file: File,
    onSaved: (background: CustomCoverBackgroundImage) => void,
  ) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string" || typeof window === "undefined") return;
      const background = createCustomBackgroundImage({
        channelId,
        name: file.name || "自定义背景",
        src: reader.result,
      });
      setCustomBackgroundImages(saveCustomBackgroundImage(window.localStorage, background));
      onSaved(background);
    };
    reader.readAsDataURL(file);
  };

  return {
    templates,
    customTemplates,
    customTemplatesForChannel: customTemplates.filter((template) => template.channel === channelId),
    templateFavoriteTimes,
    backgroundImages,
    customBackgroundImagesForChannel: customBackgroundImages.filter(
      (background) => background.channel === channelId,
    ),
    backgroundFavoriteTimes,
    createCurrentTemplateSnapshot,
    findDuplicateTemplate,
    getTemplatesForChannel,
    getBackgroundsForChannel,
    saveTemplate,
    removeTemplate,
    toggleTemplateFavorite,
    toggleBackgroundFavorite,
    removeBackground,
    saveUploadedBackground,
  };
}
