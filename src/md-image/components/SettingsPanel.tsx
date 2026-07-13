"use client";

import { PanelTopOpen } from "lucide-react";
import { useRef, useState } from "react";
import { clampDimensions } from "@/md-image/lib/dimensions";
import { themes } from "@/md-image/lib/themes";
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  fontOptions,
  fontSizeOptions,
  type FontSizePreset,
} from "@/md-image/lib/typography";
import type { Dimensions, ThemeDefinition } from "@/md-image/lib/types";
import type { WatermarkSettings } from "@/md-image/lib/types";

type SettingsPanelProps = {
  selectedThemeId: string;
  dimensions: Dimensions;
  fixedSizeEnabled: boolean;
  autoPaginate: boolean;
  imageCropToFit: boolean;
  fontId: string;
  fontSizePreset: FontSizePreset;
  customFontSize: number;
  watermark: WatermarkSettings;
  onThemeChange: (themeId: string) => void;
  onDimensionsChange: (dimensions: Dimensions) => void;
  onFixedSizeEnabledChange: (enabled: boolean) => void;
  onAutoPaginateChange: (enabled: boolean) => void;
  onImageCropToFitChange: (enabled: boolean) => void;
  onFontChange: (fontId: string) => void;
  onFontSizePresetChange: (preset: FontSizePreset) => void;
  onCustomFontSizeChange: (size: number) => void;
  onWatermarkChange: (watermark: WatermarkSettings) => void;
  onWatermarkUploadError: (message: string) => void;
};

const priorityThemeIds = [
  "memphis",
  "iphone-notes",
  "japanese-minimal",
  "punk",
  "notebook-grid",
  "elegant-vintage",
];
const priorityThemeIdSet = new Set(priorityThemeIds);
const priorityThemes = priorityThemeIds
  .map((themeId) => themes.find((theme) => theme.id === themeId))
  .filter((theme): theme is ThemeDefinition => Boolean(theme));
const remainingThemes = themes.filter((theme) => !priorityThemeIdSet.has(theme.id));
const settingsPanelClassName =
  "flex min-h-0 min-w-0 flex-col gap-4 self-start overflow-hidden border-4 border-[var(--ink)] bg-[var(--panel)] p-[18px] shadow-[8px_8px_0_var(--ink)] sticky top-[18px] max-[1080px]:static max-sm:border-[3px] max-sm:p-3 max-sm:shadow-[5px_5px_0_var(--ink)]";
const themeSettingsPanelClassName =
  "max-h-[calc(100vh-36px)] max-[1080px]:max-h-none max-[1080px]:overflow-visible";
const settingGroupClassName = "grid gap-2.5";
const settingTabPanelClassName = "grid gap-4";
const formBoxClassName =
  "flex flex-col gap-2.5 border-2 border-[var(--ink)] bg-white p-2.5";
const fieldInputClassName =
  "min-w-0 border-[3px] border-[var(--ink)] bg-white p-2 font-black focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--hot-pink)]";
const switchRowClassName =
  "flex items-center gap-2.5 border-2 border-[var(--ink)] p-2.5 font-black";
const checkboxClassName = "h-5 w-5 cursor-pointer accent-[var(--hot-pink)]";
const tabButtonClassName =
  "border-[3px] border-[var(--ink)] bg-white px-3 py-[9px] text-sm font-black text-[var(--ink)] shadow-[3px_3px_0_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--hot-pink)]";
const activeTabButtonClassName = "bg-[var(--electric-blue)] shadow-[4px_4px_0_var(--ink)]";
const themeTabButtonClassName = "bg-[#ffeb3b] shadow-[4px_4px_0_var(--hot-pink)]";
const themeTileClassName =
  "grid min-h-[124px] gap-[7px] border-[3px] border-[var(--ink)] bg-white p-2.5 text-left shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--hot-pink)]";
const activeThemeTileClassName = "bg-[var(--swatch-bg)] shadow-[5px_5px_0_var(--ink)]";
const smallButtonClassName =
  "min-h-8 border-2 border-[var(--ink)] bg-[var(--electric-blue)] px-2 py-[5px] text-xs font-black shadow-[3px_3px_0_rgba(17,17,17,0.16)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--hot-pink)]";

export function SettingsPanel({
  selectedThemeId,
  dimensions,
  fixedSizeEnabled,
  autoPaginate,
  imageCropToFit,
  fontId,
  fontSizePreset,
  customFontSize,
  watermark,
  onThemeChange,
  onDimensionsChange,
  onFixedSizeEnabledChange,
  onAutoPaginateChange,
  onImageCropToFitChange,
  onFontChange,
  onFontSizePresetChange,
  onCustomFontSizeChange,
  onWatermarkChange,
  onWatermarkUploadError,
}: SettingsPanelProps) {
  const watermarkAvatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "themes">("settings");
  const [areMoreThemesVisible, setAreMoreThemesVisible] = useState(false);

  const updateDimension = (key: keyof Dimensions, value: string) => {
    const next = clampDimensions({ ...dimensions, [key]: Number(value) });
    onDimensionsChange(next);
  };

  const updateWatermark = (next: Partial<WatermarkSettings>) => {
    onWatermarkChange({ ...watermark, ...next });
  };

  const handleWatermarkAvatarUpload = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        onWatermarkUploadError("头像读取失败，请换一张图片重试");
        return;
      }

      updateWatermark({ avatarSrc: reader.result });
    };
    reader.onerror = () => onWatermarkUploadError("头像读取失败，请换一张图片重试");
    reader.readAsDataURL(file);
  };

  const renderThemeTile = (theme: ThemeDefinition) => (
    <button
      key={theme.id}
      type="button"
      className={`${themeTileClassName} ${
        theme.id === selectedThemeId ? activeThemeTileClassName : ""
      }`}
      onClick={() => onThemeChange(theme.id)}
      style={
        {
          "--swatch-bg": theme.colors.background,
          "--swatch-accent": theme.colors.accent,
          "--swatch-secondary": theme.colors.secondary,
          "--swatch-ink": theme.colors.foreground,
        } as React.CSSProperties
      }
    >
      <span
        className="flex h-7 items-stretch border-2 border-[var(--swatch-ink)] bg-[var(--swatch-bg)]"
        aria-hidden="true"
      >
        <i className="block w-[34%] bg-[var(--swatch-accent)]" />
        <b className="block w-[34%] bg-[var(--swatch-secondary)]" />
      </span>
      <strong className="block">{theme.name}</strong>
      <small className="block text-[11px] leading-[1.35]">{theme.description}</small>
    </button>
  );

  return (
    <aside
      className={`${settingsPanelClassName} ${
        activeTab === "themes" ? themeSettingsPanelClassName : ""
      }`}
      aria-label="设置面板"
    >
      <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
        <PanelTopOpen aria-hidden="true" size={22} />
      </div>

      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="设置分类">
        <button
          id="settings-tab-main"
          type="button"
          role="tab"
          aria-controls="settings-panel-main"
          aria-selected={activeTab === "settings"}
          className={`${tabButtonClassName} ${
            activeTab === "settings" ? activeTabButtonClassName : ""
          }`}
          onClick={() => setActiveTab("settings")}
        >
          设置
        </button>
        <button
          id="settings-tab-themes"
          type="button"
          role="tab"
          aria-controls="settings-panel-themes"
          aria-selected={activeTab === "themes"}
          className={`${tabButtonClassName} ${themeTabButtonClassName}`}
          onClick={() => setActiveTab("themes")}
        >
          主题
        </button>
      </div>

      {activeTab === "settings" ? (
        <div
          id="settings-panel-main"
          className={settingTabPanelClassName}
          role="tabpanel"
          aria-labelledby="settings-tab-main"
        >
          <section className={settingGroupClassName}>
            <h3 className="m-0 text-[15px]">图片尺寸</h3>
            <label className={switchRowClassName}>
              <input
                aria-label="指定图片宽高"
                type="checkbox"
                checked={fixedSizeEnabled}
                onChange={(event) => onFixedSizeEnabledChange(event.target.checked)}
                className={checkboxClassName}
              />
              <span>指定图片宽高</span>
            </label>
            {fixedSizeEnabled ? (
              <div className="grid gap-2.5">
                <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
                  <label className={formBoxClassName}>
                    图片宽度
                    <input
                      aria-label="图片宽度"
                      inputMode="numeric"
                      min={600}
                      max={2400}
                      type="number"
                      value={dimensions.width}
                      onChange={(event) => updateDimension("width", event.target.value)}
                      className={fieldInputClassName}
                    />
                  </label>
                  <label className={formBoxClassName}>
                    图片高度
                    <input
                      aria-label="图片高度"
                      inputMode="numeric"
                      min={600}
                      max={2400}
                      type="number"
                      value={dimensions.height}
                      onChange={(event) => updateDimension("height", event.target.value)}
                      className={fieldInputClassName}
                    />
                  </label>
                </div>
                <label className={switchRowClassName}>
                  <input
                    aria-label="内容超出时自动切分"
                    type="checkbox"
                    checked={autoPaginate}
                    onChange={(event) => onAutoPaginateChange(event.target.checked)}
                    className={checkboxClassName}
                  />
                  <span>内容超出时自动切分</span>
                </label>
              </div>
            ) : null}
          </section>

          <section className={settingGroupClassName}>
            <h3 className="m-0 text-[15px]">图片显示</h3>
            <label className={switchRowClassName}>
              <input
                aria-label="按当前尺寸裁剪显示"
                type="checkbox"
                checked={imageCropToFit}
                onChange={(event) => onImageCropToFitChange(event.target.checked)}
                className={checkboxClassName}
              />
              <span>按当前尺寸裁剪显示</span>
            </label>
          </section>

          <section className={settingGroupClassName}>
            <h3 className="m-0 text-[15px]">文字排版</h3>
            <div className="grid gap-2.5">
              <label className={formBoxClassName}>
                字体
                <select
                  aria-label="字体"
                  value={fontId}
                  onChange={(event) => onFontChange(event.target.value)}
                  className={fieldInputClassName}
                >
                  {fontOptions.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={formBoxClassName}>
                字体大小
                <select
                  aria-label="字体大小"
                  value={fontSizePreset}
                  onChange={(event) =>
                    onFontSizePresetChange(event.target.value as FontSizePreset)
                  }
                  className={fieldInputClassName}
                >
                  {fontSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {fontSizePreset === "custom" ? (
              <label className="grid gap-[5px] border-2 border-[var(--ink)] bg-white p-2.5 text-xs font-black">
                <span>自定义字体大小 {customFontSize}px</span>
                <input
                  aria-label="自定义字体大小"
                  type="range"
                  min={FONT_SIZE_MIN}
                  max={FONT_SIZE_MAX}
                  value={customFontSize}
                  onChange={(event) => onCustomFontSizeChange(Number(event.target.value))}
                  className="w-full accent-[var(--hot-pink)]"
                />
              </label>
            ) : null}
          </section>

          <section className={settingGroupClassName}>
            <h3 className="m-0 text-[15px]">作者水印</h3>
            <div className={`${formBoxClassName} ${watermark.enabled ? "" : "opacity-40"}`}>
              <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-black">
                <input
                  aria-label="显示水印"
                  type="checkbox"
                  checked={watermark.enabled}
                  onChange={(event) => updateWatermark({ enabled: event.target.checked })}
                  className="h-[18px] w-[18px] cursor-pointer accent-[var(--hot-pink)]"
                />
                <span>显示水印</span>
              </label>
              <div
                className={`flex flex-col gap-2.5 ${
                  watermark.enabled ? "" : "pointer-events-none"
                }`}
              >
                <label className="grid gap-[5px] text-xs font-black">
                  <input
                    aria-label="作者名"
                    type="text"
                    value={watermark.authorName}
                    disabled={!watermark.enabled}
                    onChange={(event) => updateWatermark({ authorName: event.target.value })}
                    className={fieldInputClassName}
                  />
                </label>
                <div className="flex items-center gap-2.5">
                  {watermark.avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="block h-11 w-11 flex-none rounded-full border-2 border-[var(--ink)] object-cover"
                      alt="当前作者头像"
                      src={watermark.avatarSrc}
                    />
                  ) : (
                    <span
                      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[#f4f7fb] text-[11px] font-black"
                      aria-hidden="true"
                    >
                      无头像
                    </span>
                  )}
                  <div className="flex min-w-0 flex-wrap gap-2">
                    <button
                      type="button"
                      className={smallButtonClassName}
                      disabled={!watermark.enabled}
                      onClick={() => watermarkAvatarInputRef.current?.click()}
                    >
                      上传头像
                    </button>
                    {watermark.avatarSrc ? (
                      <button
                        type="button"
                        className={`${smallButtonClassName} bg-white`}
                        disabled={!watermark.enabled}
                        onClick={() => updateWatermark({ avatarSrc: null })}
                      >
                        移除头像
                      </button>
                    ) : null}
                  </div>
                  <input
                    ref={watermarkAvatarInputRef}
                    aria-label="上传头像"
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    disabled={!watermark.enabled}
                    onChange={(event) => {
                      handleWatermarkAvatarUpload(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section
          id="settings-panel-themes"
          className={`${settingGroupClassName} ${settingTabPanelClassName} min-h-0 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable] max-[1080px]:overflow-visible max-[1080px]:pr-0`}
          role="tabpanel"
          aria-labelledby="settings-tab-themes"
        >
          <h3 className="m-0 text-[15px]">主题风格</h3>
          <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
            {priorityThemes.map(renderThemeTile)}
          </div>
          <div className="flex">
            <button
              type="button"
              className="w-full border-[3px] border-[var(--ink)] bg-[var(--electric-blue)] px-3 py-2.5 text-[13px] font-black text-[var(--ink)] shadow-[4px_4px_0_rgba(0,0,0,0.16)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--hot-pink)]"
              aria-expanded={areMoreThemesVisible}
              onClick={() => setAreMoreThemesVisible((visible) => !visible)}
            >
              {areMoreThemesVisible ? "收起更多主题" : "展开更多主题"}
            </button>
          </div>
          {areMoreThemesVisible ? (
            <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
              {remainingThemes.map(renderThemeTile)}
            </div>
          ) : null}
        </section>
      )}
    </aside>
  );
}
