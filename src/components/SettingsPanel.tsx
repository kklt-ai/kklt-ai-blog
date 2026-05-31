"use client";

import { PanelTopOpen } from "lucide-react";
import { useRef, useState } from "react";
import { clampDimensions } from "@/lib/dimensions";
import { themes } from "@/lib/themes";
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  fontOptions,
  fontSizeOptions,
  type FontSizePreset,
} from "@/lib/typography";
import type { Dimensions, ThemeDefinition } from "@/lib/types";
import type { WatermarkSettings } from "@/lib/types";

type SettingsPanelProps = {
  selectedThemeId: string;
  dimensions: Dimensions;
  fixedSizeEnabled: boolean;
  autoPaginate: boolean;
  fontId: string;
  fontSizePreset: FontSizePreset;
  customFontSize: number;
  watermark: WatermarkSettings;
  onThemeChange: (themeId: string) => void;
  onDimensionsChange: (dimensions: Dimensions) => void;
  onFixedSizeEnabledChange: (enabled: boolean) => void;
  onAutoPaginateChange: (enabled: boolean) => void;
  onFontChange: (fontId: string) => void;
  onFontSizePresetChange: (preset: FontSizePreset) => void;
  onCustomFontSizeChange: (size: number) => void;
  onWatermarkChange: (watermark: WatermarkSettings) => void;
  onWatermarkUploadError: (message: string) => void;
};

const priorityThemeIds = ["memphis", "iphone-notes", "japanese-minimal", "punk"];
const priorityThemeIdSet = new Set(priorityThemeIds);
const priorityThemes = priorityThemeIds
  .map((themeId) => themes.find((theme) => theme.id === themeId))
  .filter((theme): theme is ThemeDefinition => Boolean(theme));
const remainingThemes = themes.filter((theme) => !priorityThemeIdSet.has(theme.id));

export function SettingsPanel({
  selectedThemeId,
  dimensions,
  fixedSizeEnabled,
  autoPaginate,
  fontId,
  fontSizePreset,
  customFontSize,
  watermark,
  onThemeChange,
  onDimensionsChange,
  onFixedSizeEnabledChange,
  onAutoPaginateChange,
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
      className={`theme-tile ${theme.id === selectedThemeId ? "is-active" : ""}`}
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
      <span className="theme-swatch" aria-hidden="true">
        <i />
        <b />
      </span>
      <strong>{theme.name}</strong>
      <small>{theme.description}</small>
    </button>
  );

  return (
    <aside className="workspace-panel settings-panel" aria-label="设置面板">
      <div className="panel-heading">
        <PanelTopOpen aria-hidden="true" size={22} />
      </div>

      <div className="settings-tabs" role="tablist" aria-label="设置分类">
        <button
          id="settings-tab-main"
          type="button"
          role="tab"
          aria-controls="settings-panel-main"
          aria-selected={activeTab === "settings"}
          className={`settings-tab ${activeTab === "settings" ? "is-active" : ""}`}
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
          className={`settings-tab settings-tab--theme ${
            activeTab === "themes" ? "is-active" : ""
          }`}
          onClick={() => setActiveTab("themes")}
        >
          主题
        </button>
      </div>

      {activeTab === "settings" ? (
        <div
          id="settings-panel-main"
          className="settings-tab-panel"
          role="tabpanel"
          aria-labelledby="settings-tab-main"
        >
          <section className="setting-group">
            <h3>图片尺寸</h3>
            <label className="switch-row">
              <input
                aria-label="指定图片宽高"
                type="checkbox"
                checked={fixedSizeEnabled}
                onChange={(event) => onFixedSizeEnabledChange(event.target.checked)}
              />
              <span>指定图片宽高</span>
            </label>
            {fixedSizeEnabled ? (
              <div className="fixed-size-options">
                <div className="dimension-row">
                  <label>
                    图片宽度
                    <input
                      aria-label="图片宽度"
                      inputMode="numeric"
                      min={600}
                      max={2400}
                      type="number"
                      value={dimensions.width}
                      onChange={(event) => updateDimension("width", event.target.value)}
                    />
                  </label>
                  <label>
                    图片高度
                    <input
                      aria-label="图片高度"
                      inputMode="numeric"
                      min={600}
                      max={2400}
                      type="number"
                      value={dimensions.height}
                      onChange={(event) => updateDimension("height", event.target.value)}
                    />
                  </label>
                </div>
                <label className="switch-row">
                  <input
                    aria-label="内容超出时自动切分"
                    type="checkbox"
                    checked={autoPaginate}
                    onChange={(event) => onAutoPaginateChange(event.target.checked)}
                  />
                  <span>内容超出时自动切分</span>
                </label>
              </div>
            ) : null}
          </section>

          <section className="setting-group">
            <h3>文字排版</h3>
            <div className="typography-controls">
              <label>
                字体
                <select
                  aria-label="字体"
                  value={fontId}
                  onChange={(event) => onFontChange(event.target.value)}
                >
                  {fontOptions.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                字体大小
                <select
                  aria-label="字体大小"
                  value={fontSizePreset}
                  onChange={(event) =>
                    onFontSizePresetChange(event.target.value as FontSizePreset)
                  }
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
              <label className="font-size-slider">
                <span>自定义字体大小 {customFontSize}px</span>
                <input
                  aria-label="自定义字体大小"
                  type="range"
                  min={FONT_SIZE_MIN}
                  max={FONT_SIZE_MAX}
                  value={customFontSize}
                  onChange={(event) => onCustomFontSizeChange(Number(event.target.value))}
                />
              </label>
            ) : null}
          </section>

          <section className="setting-group">
            <h3>作者水印</h3>
            <div className={`watermark-box${watermark.enabled ? "" : " watermark-box--off"}`}>
              <label className="watermark-toggle">
                <input
                  aria-label="显示水印"
                  type="checkbox"
                  checked={watermark.enabled}
                  onChange={(event) => updateWatermark({ enabled: event.target.checked })}
                />
                <span>显示水印</span>
              </label>
              <div className="watermark-fields">
                <label className="watermark-name-field">
                  <input
                    aria-label="作者名"
                    type="text"
                    value={watermark.authorName}
                    disabled={!watermark.enabled}
                    onChange={(event) => updateWatermark({ authorName: event.target.value })}
                  />
                </label>
                <div className="watermark-avatar-row">
                  {watermark.avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="watermark-avatar-preview"
                      alt="当前作者头像"
                      src={watermark.avatarSrc}
                    />
                  ) : (
                    <span className="watermark-avatar-empty" aria-hidden="true">
                      无头像
                    </span>
                  )}
                  <div className="watermark-avatar-actions">
                    <button
                      type="button"
                      className="watermark-avatar-button"
                      disabled={!watermark.enabled}
                      onClick={() => watermarkAvatarInputRef.current?.click()}
                    >
                      上传头像
                    </button>
                    {watermark.avatarSrc ? (
                      <button
                        type="button"
                        className="watermark-avatar-button watermark-avatar-button--muted"
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
          className="setting-group settings-tab-panel"
          role="tabpanel"
          aria-labelledby="settings-tab-themes"
        >
          <h3>主题风格</h3>
          <div className="theme-grid">{priorityThemes.map(renderThemeTile)}</div>
          <div className="theme-actions">
            <button
              type="button"
              className="theme-expand-button"
              aria-expanded={areMoreThemesVisible}
              onClick={() => setAreMoreThemesVisible((visible) => !visible)}
            >
              {areMoreThemesVisible ? "收起更多主题" : "展开更多主题"}
            </button>
          </div>
          {areMoreThemesVisible ? (
            <div className="theme-grid">{remainingThemes.map(renderThemeTile)}</div>
          ) : null}
        </section>
      )}
    </aside>
  );
}
