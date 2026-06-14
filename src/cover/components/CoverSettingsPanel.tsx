import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ArrowRight,
  Bold,
  Image as ImageIcon,
  Italic,
  Type,
  Underline,
} from "lucide-react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useState,
} from "react";
import {
  COVER_FONT_FAMILIES,
  type CoverIconLayer,
  type CoverImageLayer,
  type CoverLayer,
  type CoverTextLayer,
  findBrandIcon,
} from "@/cover/lib/cover";
import type { PatchSelectedLayer } from "./coverEditorTypes";
import { TextEffectPicker } from "./TextEffectPicker";
import { TextHighlightPicker } from "./TextHighlightPicker";
import type { TextEffectCategoryId } from "./textEffectOptions";

type CoverSettingsPanelProps = {
  selectedLayer: CoverLayer | null;
  activeEffectCategoryId: TextEffectCategoryId;
  onActiveEffectCategoryChange: (categoryId: TextEffectCategoryId) => void;
  patchSelectedLayer: PatchSelectedLayer;
};

const DRAG_PIXELS_PER_STEP = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function decimalPlaces(step: number) {
  const [, decimals = ""] = step.toString().split(".");
  return decimals.length;
}

function roundToStep(value: number, step: number) {
  return Number(value.toFixed(decimalPlaces(step)));
}

function getDragClientX(
  event: ReactMouseEvent<HTMLDivElement> | ReactPointerEvent<HTMLDivElement>,
) {
  const nativeEvent = event.nativeEvent as PointerEvent & { pageX?: number };
  const coordinates = [event.clientX, nativeEvent.clientX, nativeEvent.pageX];
  return coordinates.find(
    (coordinate): coordinate is number =>
      typeof coordinate === "number" && Number.isFinite(coordinate),
  );
}

function SpacingDragControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const [dragStart, setDragStart] = useState<{ x: number; value: number } | null>(null);
  const dragging = Boolean(dragStart);

  const applyValue = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) return;
    onChange(roundToStep(clamp(nextValue, min, max), step));
  };

  const beginDrag = (
    event: ReactMouseEvent<HTMLDivElement> | ReactPointerEvent<HTMLDivElement>,
  ) => {
    const clientX = getDragClientX(event);
    if (clientX === undefined) return;
    event.preventDefault();
    setDragStart({ x: clientX, value });
  };

  const moveDrag = (
    event: ReactMouseEvent<HTMLDivElement> | ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!dragStart) return;
    const clientX = getDragClientX(event);
    if (clientX === undefined) return;
    const steps = Math.round((clientX - dragStart.x) / DRAG_PIXELS_PER_STEP);
    applyValue(dragStart.value + steps * step);
  };

  const beginPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    beginDrag(event);
  };

  const endPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragStart(null);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      applyValue(value - step);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      applyValue(value + step);
    }
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value}`}
      onPointerDown={beginPointerDrag}
      onPointerMove={moveDrag}
      onPointerUp={endPointerDrag}
      onPointerCancel={endPointerDrag}
      onMouseDown={beginDrag}
      onMouseMove={moveDrag}
      onMouseUp={() => setDragStart(null)}
      onMouseLeave={() => setDragStart(null)}
      onKeyDown={handleKeyDown}
      className={[
        "grid h-12 cursor-ew-resize select-none grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border border-[#979696]/35 bg-[#f3f0ef] px-2 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-black/10",
        dragging ? "bg-white shadow-sm ring-2 ring-[#26251e]" : "hover:bg-white",
      ].join(" ")}
    >
      <span className="justify-self-start whitespace-nowrap text-[#504f49]">{label}</span>
      <span className="min-w-8 justify-self-center text-center text-[#26251e]">{value}</span>
      <span className="flex min-w-0 items-center justify-end gap-1 text-[#504f49]">
        {dragging && (
          <>
            <ArrowLeft size={15} aria-label={`向左减少${label}`} strokeWidth={2.4} />
            <ArrowRight size={15} aria-label={`向右增加${label}`} strokeWidth={2.4} />
          </>
        )}
      </span>
    </div>
  );
}

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
        active ? "bg-white text-[#26251e] shadow-sm" : "text-[#504f49] hover:bg-white hover:text-[#26251e]",
      ].join(" ")}
    >
      <Icon size={19} aria-hidden="true" strokeWidth={2.2} />
    </button>
  );
}

function SettingSectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#504f49]">
      {children}
    </p>
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
      <div>
        <SettingSectionLabel>Typography</SettingSectionLabel>
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
              className="h-12 w-full rounded-md border border-[#979696]/55 bg-white px-3 text-sm font-semibold text-[#26251e] outline-none transition focus:border-[#26251e] focus:ring-2 focus:ring-black/10"
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
              className="h-12 w-full rounded-md border border-[#979696]/55 bg-white px-3 text-center text-sm font-semibold text-[#26251e] outline-none transition focus:border-[#26251e] focus:ring-2 focus:ring-black/10"
            />
          </label>
        </div>
      </div>

      <div>
        <SettingSectionLabel>Style</SettingSectionLabel>
        <div className="grid grid-cols-3 gap-1 rounded-md border border-[#979696]/35 bg-[#f3f0ef] p-1">
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
      </div>

      <div>
        <SettingSectionLabel>Align</SettingSectionLabel>
        <div className="grid grid-cols-3 gap-1 rounded-md border border-[#979696]/35 bg-[#f3f0ef] p-1">
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
      </div>

      <div>
        <SettingSectionLabel>Spacing</SettingSectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <SpacingDragControl
            label="行间距"
            value={layer.lineHeight}
            min={0.8}
            max={2}
            step={0.01}
            onChange={(lineHeight) => patchSelectedLayer<CoverTextLayer>({ lineHeight })}
          />
          <SpacingDragControl
            label="字间距"
            value={layer.letterSpacing}
            min={-20}
            max={60}
            step={1}
            onChange={(letterSpacing) => patchSelectedLayer<CoverTextLayer>({ letterSpacing })}
          />
        </div>
      </div>

      <label className="flex items-center justify-between gap-3 border-y border-[#f3f0ef] py-4">
        <span className="text-sm font-semibold text-[#26251e]">文字颜色</span>
        <input
          aria-label="文字颜色"
          type="color"
          value={layer.color}
          onChange={(event) => patchSelectedLayer<CoverTextLayer>({ color: event.target.value })}
          className="h-11 w-16 rounded-md border border-[#f3f0ef] bg-white p-1"
        />
      </label>

      <div>
        <SettingSectionLabel>Effects</SettingSectionLabel>
        <div role="group" aria-label="文字装饰" className="flex flex-wrap items-center gap-2">
          <TextHighlightPicker
            activeEffect={layer.highlightEffect ?? "none"}
            onEffectChange={(highlightEffect) =>
              patchSelectedLayer<CoverTextLayer>({ highlightEffect })
            }
          />

          <TextEffectPicker
            activeCategoryId={activeEffectCategoryId}
            activeEffect={layer.textEffect ?? "none"}
            onCategoryChange={onActiveEffectCategoryChange}
            onEffectChange={(textEffect) => patchSelectedLayer<CoverTextLayer>({ textEffect })}
          />
        </div>
      </div>
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
      <div className="rounded-lg border border-[#979696]/35 bg-[#f3f0ef] p-4">
        <Type size={20} aria-hidden="true" />
        <p className="mt-2 font-bold">{findBrandIcon(layer.iconId).name}</p>
        <p className="mt-1 text-sm font-medium text-[#504f49]">可拖拽定位。</p>
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
          className="w-full accent-[#26251e]"
        />
      </label>
    </div>
  );
}

function ImageLayerSettings({
  layer,
  patchSelectedLayer,
}: {
  layer: CoverImageLayer;
  patchSelectedLayer: PatchSelectedLayer;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#979696]/35 bg-[#f3f0ef] p-4">
        <ImageIcon size={20} aria-hidden="true" />
        <p className="mt-2 break-all font-bold">{layer.alt}</p>
        <p className="mt-1 text-sm font-medium text-[#504f49]">可拖拽定位和四角缩放。</p>
      </div>
      <label>
        <span className="mb-2 block text-sm font-bold">图片宽度</span>
        <input
          aria-label="图片宽度"
          type="range"
          min={8}
          max={96}
          value={layer.width}
          onChange={(event) =>
            patchSelectedLayer<CoverImageLayer>({ width: Number(event.target.value) })
          }
          className="w-full accent-[#26251e]"
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
      className="border-l border-[#f3f0ef] bg-[#fcfaf8] px-4 py-4 max-xl:border-l-0 max-xl:border-t"
    >
      <section aria-label="图层编辑">
        {!selectedLayer && (
          <div className="rounded-lg border border-[#979696]/35 bg-[#f3f0ef] p-4 text-center text-sm font-semibold text-[#504f49]">
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
        {selectedLayer?.type === "image" && (
          <ImageLayerSettings layer={selectedLayer} patchSelectedLayer={patchSelectedLayer} />
        )}
      </section>
    </aside>
  );
}
