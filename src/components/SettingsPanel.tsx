"use client";

import { Download, Images, PanelTopOpen } from "lucide-react";
import { clampDimensions } from "@/lib/dimensions";
import { themes } from "@/lib/themes";
import type { Dimensions } from "@/lib/types";

type SettingsPanelProps = {
  selectedThemeId: string;
  dimensions: Dimensions;
  autoPaginate: boolean;
  isExporting: boolean;
  onThemeChange: (themeId: string) => void;
  onDimensionsChange: (dimensions: Dimensions) => void;
  onAutoPaginateChange: (enabled: boolean) => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
};

export function SettingsPanel({
  selectedThemeId,
  dimensions,
  autoPaginate,
  isExporting,
  onThemeChange,
  onDimensionsChange,
  onAutoPaginateChange,
  onExportCurrent,
  onExportAll,
}: SettingsPanelProps) {
  const updateDimension = (key: keyof Dimensions, value: string) => {
    const next = clampDimensions({ ...dimensions, [key]: Number(value) });
    onDimensionsChange(next);
  };

  return (
    <aside className="workspace-panel settings-panel" aria-label="设置面板">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Style</p>
          <h2>设置</h2>
        </div>
        <PanelTopOpen aria-hidden="true" size={22} />
      </div>

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

      <section className="setting-group">
        <h3>图片尺寸</h3>
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
        <button
          className="preset-button"
          type="button"
          onClick={() => onDimensionsChange({ width: 1080, height: 1440 })}
        >
          小红书默认 1080 x 1440
        </button>
      </section>

      <section className="setting-group">
        <h3>分页</h3>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={autoPaginate}
            onChange={(event) => onAutoPaginateChange(event.target.checked)}
          />
          <span>自动分割长内容</span>
        </label>
        <p className="setting-note">单独一行输入 ------- 可以强制切成下一张图。</p>
      </section>

      <section className="export-actions" aria-label="导出">
        <button type="button" disabled={isExporting} onClick={onExportCurrent}>
          <Download aria-hidden="true" size={18} />
          导出当前页
        </button>
        <button type="button" disabled={isExporting} onClick={onExportAll}>
          <Images aria-hidden="true" size={18} />
          导出全部 PNG
        </button>
      </section>
    </aside>
  );
}
