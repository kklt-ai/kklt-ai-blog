"use client";

import { PanelTopOpen } from "lucide-react";
import { clampDimensions } from "@/lib/dimensions";
import { themes } from "@/lib/themes";
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  fontOptions,
  fontSizeOptions,
  type FontSizePreset,
} from "@/lib/typography";
import type { Dimensions } from "@/lib/types";

type SettingsPanelProps = {
  selectedThemeId: string;
  dimensions: Dimensions;
  fixedSizeEnabled: boolean;
  autoPaginate: boolean;
  fontId: string;
  fontSizePreset: FontSizePreset;
  customFontSize: number;
  onThemeChange: (themeId: string) => void;
  onDimensionsChange: (dimensions: Dimensions) => void;
  onFixedSizeEnabledChange: (enabled: boolean) => void;
  onAutoPaginateChange: (enabled: boolean) => void;
  onFontChange: (fontId: string) => void;
  onFontSizePresetChange: (preset: FontSizePreset) => void;
  onCustomFontSizeChange: (size: number) => void;
};

export function SettingsPanel({
  selectedThemeId,
  dimensions,
  fixedSizeEnabled,
  autoPaginate,
  fontId,
  fontSizePreset,
  customFontSize,
  onThemeChange,
  onDimensionsChange,
  onFixedSizeEnabledChange,
  onAutoPaginateChange,
  onFontChange,
  onFontSizePresetChange,
  onCustomFontSizeChange,
}: SettingsPanelProps) {
  const updateDimension = (key: keyof Dimensions, value: string) => {
    const next = clampDimensions({ ...dimensions, [key]: Number(value) });
    onDimensionsChange(next);
  };

  return (
    <aside className="workspace-panel settings-panel" aria-label="设置面板">
      <div className="panel-heading">
        <PanelTopOpen aria-hidden="true" size={22} />
      </div>

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
        <h3>主题风格</h3>
        <div className="theme-grid">
          {themes.map((theme) => (
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
          ))}
        </div>
      </section>
    </aside>
  );
}
