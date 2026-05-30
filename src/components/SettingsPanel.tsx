"use client";

import { Download, Images, PanelTopOpen, RotateCcw } from "lucide-react";
import { clampDimensions } from "@/lib/dimensions";
import { resolveThemeSyntax, themes } from "@/lib/themes";
import type {
  Dimensions,
  ThemeDefinition,
  ThemeSyntaxOverrides,
  ThemeSyntaxStyles,
} from "@/lib/types";

type SettingsPanelProps = {
  selectedThemeId: string;
  activeTheme: ThemeDefinition;
  dimensions: Dimensions;
  fixedSizeEnabled: boolean;
  autoPaginate: boolean;
  isExporting: boolean;
  syntaxOverrides: ThemeSyntaxOverrides;
  onThemeChange: (themeId: string) => void;
  onDimensionsChange: (dimensions: Dimensions) => void;
  onFixedSizeEnabledChange: (enabled: boolean) => void;
  onAutoPaginateChange: (enabled: boolean) => void;
  onSyntaxOverrideChange: <Key extends keyof ThemeSyntaxStyles>(
    key: Key,
    value: ThemeSyntaxStyles[Key],
  ) => void;
  onResetSyntaxOverrides: () => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
};

type ColorSyntaxKey = {
  [Key in keyof ThemeSyntaxStyles]: ThemeSyntaxStyles[Key] extends string ? Key : never;
}[keyof ThemeSyntaxStyles];

const colorControls: Array<{ key: ColorSyntaxKey; label: string }> = [
  { key: "headingColor", label: "标题文字色" },
  { key: "strongColor", label: "粗体强调色" },
  { key: "highlightBackground", label: "高亮背景色" },
  { key: "codeBackground", label: "代码背景色" },
  { key: "listMarkerColor", label: "列表符号色" },
  { key: "imageBorderColor", label: "图片边框色" },
];

export function SettingsPanel({
  selectedThemeId,
  activeTheme,
  dimensions,
  fixedSizeEnabled,
  autoPaginate,
  isExporting,
  syntaxOverrides,
  onThemeChange,
  onDimensionsChange,
  onFixedSizeEnabledChange,
  onAutoPaginateChange,
  onSyntaxOverrideChange,
  onResetSyntaxOverrides,
  onExportCurrent,
  onExportAll,
}: SettingsPanelProps) {
  const syntax = resolveThemeSyntax(activeTheme, syntaxOverrides);

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
        <h3>图片尺寸</h3>
        <p className="setting-note">默认生成一整张长图，高度会随内容自动增长。</p>
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
            <button
              className="preset-button"
              type="button"
              onClick={() => onDimensionsChange({ width: 1080, height: 1440 })}
            >
              小红书默认 1080 x 1440
            </button>
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
        <p className="setting-note">单独一行输入 ------- 可以强制切成下一张图。</p>
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

      <section className="setting-group">
        <div className="setting-title-row">
          <h3>Markdown 样式</h3>
          <button
            className="mini-icon-button"
            type="button"
            onClick={onResetSyntaxOverrides}
            title="恢复当前主题的 Markdown 样式"
            aria-label="恢复 Markdown 样式"
          >
            <RotateCcw aria-hidden="true" size={14} />
          </button>
        </div>
        <div className="syntax-control-grid">
          {colorControls.map((control) => (
            <label key={control.key} className="color-control">
              <span>{control.label}</span>
              <input
                aria-label={control.label}
                type="color"
                value={String(syntax[control.key])}
                onChange={(event) =>
                  onSyntaxOverrideChange(control.key, event.target.value)
                }
              />
            </label>
          ))}
          <label className="range-control">
            <span>图片圆角</span>
            <input
              aria-label="图片圆角"
              min={0}
              max={48}
              type="range"
              value={syntax.imageRadius}
              onChange={(event) =>
                onSyntaxOverrideChange("imageRadius", Number(event.target.value))
              }
            />
            <b>{syntax.imageRadius}px</b>
          </label>
        </div>
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
