import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Type,
  Underline,
} from "lucide-react";
import {
  COVER_FONT_FAMILIES,
  type CoverIconLayer,
  type CoverLayer,
  type CoverTextLayer,
  findBrandIcon,
} from "@/cover/lib/cover";
import type { PatchSelectedLayer } from "./coverEditorTypes";
import { TextEffectPicker } from "./TextEffectPicker";
import type { TextEffectCategoryId } from "./textEffectOptions";

type CoverSettingsPanelProps = {
  selectedLayer: CoverLayer | null;
  activeEffectCategoryId: TextEffectCategoryId;
  onActiveEffectCategoryChange: (categoryId: TextEffectCategoryId) => void;
  patchSelectedLayer: PatchSelectedLayer;
};

function TextStyleButton({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: typeof Bold;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={[
        "inline-flex h-10 items-center justify-center rounded-md transition",
        active ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:bg-white hover:text-zinc-950",
      ].join(" ")}
    >
      <Icon size={19} aria-hidden="true" strokeWidth={2.2} />
    </button>
  );
}

function TextLayerSettings({
  layer,
  activeEffectCategoryId,
  onActiveEffectCategoryChange,
  patchSelectedLayer,
}: {
  layer: CoverTextLayer;
  activeEffectCategoryId: TextEffectCategoryId;
  onActiveEffectCategoryChange: (categoryId: TextEffectCategoryId) => void;
  patchSelectedLayer: PatchSelectedLayer;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[1fr_86px] gap-2">
        <label className="block">
          <span className="sr-only">字体</span>
          <select
            aria-label="字体"
            value={layer.fontFamily}
            onChange={(event) =>
              patchSelectedLayer<CoverTextLayer>({
                fontFamily: event.target.value as CoverTextLayer["fontFamily"],
              })
            }
            className="h-12 w-full rounded-lg border-0 bg-zinc-100 px-3 text-sm font-bold outline-none transition focus:bg-white focus:ring-2 focus:ring-zinc-300"
          >
            {COVER_FONT_FAMILIES.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">字号</span>
          <input
            aria-label="字号"
            type="number"
            min={18}
            max={180}
            value={layer.fontSize}
            onChange={(event) =>
              patchSelectedLayer<CoverTextLayer>({ fontSize: Number(event.target.value) })
            }
            className="h-12 w-full rounded-lg border-0 bg-zinc-100 px-3 text-center text-sm font-bold outline-none transition focus:bg-white focus:ring-2 focus:ring-zinc-300"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1">
        <TextStyleButton
          label="加粗"
          icon={Bold}
          active={layer.bold}
          onClick={() => patchSelectedLayer<CoverTextLayer>({ bold: !layer.bold })}
        />
        <TextStyleButton
          label="斜体"
          icon={Italic}
          active={layer.italic}
          onClick={() => patchSelectedLayer<CoverTextLayer>({ italic: !layer.italic })}
        />
        <TextStyleButton
          label="下划线"
          icon={Underline}
          active={layer.underline}
          onClick={() => patchSelectedLayer<CoverTextLayer>({ underline: !layer.underline })}
        />
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1">
        {[
          { label: "左对齐", icon: AlignLeft, align: "left" as const },
          { label: "居中", icon: AlignCenter, align: "center" as const },
          { label: "右对齐", icon: AlignRight, align: "right" as const },
        ].map((item) => (
          <TextStyleButton
            key={item.label}
            label={item.label}
            icon={item.icon}
            active={layer.align === item.align}
            onClick={() => patchSelectedLayer<CoverTextLayer>({ align: item.align })}
          />
        ))}
      </div>

      <label className="flex items-center justify-between gap-3 border-y border-zinc-100 py-4">
        <span className="text-sm font-bold">文字颜色</span>
        <input
          aria-label="文字颜色"
          type="color"
          value={layer.color}
          onChange={(event) => patchSelectedLayer<CoverTextLayer>({ color: event.target.value })}
          className="h-11 w-16 rounded-lg border-0 bg-zinc-100 p-1"
        />
      </label>

      <TextEffectPicker
        activeCategoryId={activeEffectCategoryId}
        activeEffect={layer.textEffect ?? "none"}
        onCategoryChange={onActiveEffectCategoryChange}
        onEffectChange={(textEffect) => patchSelectedLayer<CoverTextLayer>({ textEffect })}
      />
    </div>
  );
}

function IconLayerSettings({
  layer,
  patchSelectedLayer,
}: {
  layer: CoverIconLayer;
  patchSelectedLayer: PatchSelectedLayer;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <Type size={20} aria-hidden="true" />
        <p className="mt-2 font-bold">{findBrandIcon(layer.iconId).name}</p>
        <p className="mt-1 text-sm font-semibold text-zinc-500">可拖拽定位。</p>
      </div>
      <label>
        <span className="mb-2 block text-sm font-bold">图标大小</span>
        <input
          aria-label="图标大小"
          type="range"
          min={6}
          max={24}
          value={layer.size}
          onChange={(event) =>
            patchSelectedLayer<CoverIconLayer>({ size: Number(event.target.value) })
          }
          className="w-full accent-fuchsia-600"
        />
      </label>
    </div>
  );
}

export function CoverSettingsPanel({
  selectedLayer,
  activeEffectCategoryId,
  onActiveEffectCategoryChange,
  patchSelectedLayer,
}: CoverSettingsPanelProps) {
  return (
    <aside
      aria-label="封面设置"
      className="border-l border-zinc-200 bg-white px-5 py-5 max-xl:border-l-0 max-xl:border-t"
    >
      <section aria-label="图层编辑">
        {!selectedLayer && (
          <div className="rounded-lg bg-zinc-100 p-4 text-center text-sm font-semibold text-zinc-500">
            未选择图层
          </div>
        )}
        {selectedLayer?.type === "text" && (
          <TextLayerSettings
            layer={selectedLayer}
            activeEffectCategoryId={activeEffectCategoryId}
            onActiveEffectCategoryChange={onActiveEffectCategoryChange}
            patchSelectedLayer={patchSelectedLayer}
          />
        )}
        {selectedLayer?.type === "icon" && (
          <IconLayerSettings layer={selectedLayer} patchSelectedLayer={patchSelectedLayer} />
        )}
      </section>
    </aside>
  );
}
