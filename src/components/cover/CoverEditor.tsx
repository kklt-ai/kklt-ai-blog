"use client";

import Link from "next/link";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  Italic,
  MousePointer2,
  Plus,
  Trash2,
  Type,
  Underline,
} from "lucide-react";
import {
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { downloadNodeAsPng } from "@/lib/export";
import {
  BRAND_ICONS,
  COVER_CHANNELS,
  COVER_FONT_FAMILIES,
  type BrandIconId,
  type CoverChannelId,
  type CoverIconLayer,
  type CoverLayer,
  type CoverTextLayer,
  createIconLayer,
  createTextLayer,
  cloneTemplateLayers,
  findBrandIcon,
  fontFamilyCss,
  getChannel,
  getTemplatesByChannel,
  updateLayer,
} from "@/lib/cover";

type DragState = {
  layerId: string;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
};

const CANVAS_ZOOM_STEP = 0.04;
const MIN_CANVAS_SCALE = 0.2;
const MAX_CANVAS_SCALE = 0.8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function defaultCanvasScale(channelId: CoverChannelId) {
  return channelId === "wechat" ? 0.56 : 0.36;
}

function layerKey(layer: CoverLayer) {
  return `${layer.type}-${layer.id}`;
}

function TextLayerView({
  layer,
  selected,
  editing,
  onSelect,
  onDragStart,
  onEditStart,
  onTextChange,
  onFinishEditing,
  onDelete,
  interactive = true,
}: {
  layer: CoverTextLayer;
  selected: boolean;
  editing?: boolean;
  onSelect?: () => void;
  onDragStart?: (event: ReactPointerEvent<HTMLButtonElement>, layer: CoverLayer) => void;
  onEditStart?: () => void;
  onTextChange?: (text: string) => void;
  onFinishEditing?: () => void;
  onDelete?: () => void;
  interactive?: boolean;
}) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const className = [
    "touch-none whitespace-pre-line rounded-2xl border-2 px-3 py-2 text-inherit",
    interactive ? "transition" : "",
    editing && interactive
      ? "border-sky-400 bg-white/20 outline-none ring-4 ring-sky-300/30"
      : selected && interactive
      ? "border-sky-400 bg-white/15 shadow-[0_0_0_4px_rgba(56,189,248,0.24)]"
      : interactive
        ? "border-transparent hover:border-white/70"
        : "border-transparent",
  ].join(" ");
  const positionedClassName = `absolute ${className}`;
  const positionStyle: CSSProperties = {
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    width: `${layer.width}%`,
  };
  const textStyle: CSSProperties = {
    color: layer.color,
    fontSize: `${layer.fontSize}px`,
    fontFamily: fontFamilyCss(layer.fontFamily),
    fontWeight: layer.bold ? 900 : 500,
    fontStyle: layer.italic ? "italic" : "normal",
    textDecoration: layer.underline ? "underline" : "none",
    textAlign: layer.align,
    lineHeight: 1.08,
    letterSpacing: layer.letterSpacing ? `${layer.letterSpacing}px` : undefined,
  };
  const style: CSSProperties = {
    ...positionStyle,
    ...textStyle,
  };

  useEffect(() => {
    if (!editing) return;
    editorRef.current?.focus();
    editorRef.current?.select();
  }, [editing]);

  if (!interactive) {
    return (
      <div className={positionedClassName} style={style}>
        {layer.text}
      </div>
    );
  }

  if (editing) {
    return (
      <textarea
        ref={editorRef}
        aria-label={`${layer.text.replace(/\s+/g, " ")} 文字编辑框`}
        value={layer.text}
        onChange={(event) => onTextChange?.(event.target.value)}
        onBlur={onFinishEditing}
        onPointerDown={(event) => event.stopPropagation()}
        data-cover-text-editor="true"
        className={`${positionedClassName} resize-none`}
        style={style}
      />
    );
  }

  return (
    <div className="group absolute" style={positionStyle}>
      <button
        type="button"
        aria-label={`${layer.text.replace(/\s+/g, " ")} 文字图层`}
        onClick={onSelect}
        onDoubleClick={onEditStart}
        onPointerDown={(event) => onDragStart?.(event, layer)}
        className={`${className} h-full w-full`}
        style={textStyle}
      >
        {layer.text}
      </button>
      <LayerDeleteButton
        label={`删除 ${layer.text.replace(/\s+/g, " ")} 图层`}
        selected={selected}
        onDelete={onDelete}
      />
    </div>
  );
}

function IconLayerView({
  layer,
  selected,
  onSelect,
  onDragStart,
  onDelete,
  interactive = true,
}: {
  layer: CoverIconLayer;
  selected: boolean;
  onSelect?: () => void;
  onDragStart?: (event: ReactPointerEvent<HTMLButtonElement>, layer: CoverLayer) => void;
  onDelete?: () => void;
  interactive?: boolean;
}) {
  const icon = findBrandIcon(layer.iconId);
  const className = [
    "flex h-full w-full touch-none items-center justify-center rounded-[28%] border-2 font-black shadow-xl",
    interactive ? "transition" : "",
    icon.className,
    selected && interactive
      ? "border-sky-300 ring-4 ring-sky-300/35"
      : interactive
        ? "border-white/70 hover:ring-4 hover:ring-white/30"
        : "border-white/70",
  ].join(" ");
  const style: CSSProperties = {
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    width: `${layer.size}%`,
    aspectRatio: "1 / 1",
    fontSize: `${Math.max(13, layer.size * 2.4)}px`,
  };

  if (!interactive) {
    return (
      <div className={`absolute ${className}`} style={style}>
        {icon.mark}
      </div>
    );
  }

  return (
    <div className="group absolute" style={style}>
      <button
        type="button"
        aria-label={`${icon.name} 图标图层`}
        onClick={onSelect}
        onPointerDown={(event) => onDragStart?.(event, layer)}
        className={className}
      >
        {icon.mark}
      </button>
      <LayerDeleteButton
        label={`删除 ${icon.name} 图层`}
        selected={selected}
        onDelete={onDelete}
      />
    </div>
  );
}

function LayerDeleteButton({
  label,
  selected,
  onDelete,
}: {
  label: string;
  selected: boolean;
  onDelete?: () => void;
}) {
  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      onPointerDown={(event) => event.stopPropagation()}
      className={[
        "absolute -right-3 -top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-950 bg-white text-rose-600 shadow-[2px_2px_0_#18181b] transition hover:bg-rose-100",
        selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
      ].join(" ")}
    >
      <Trash2 size={17} aria-hidden="true" />
    </button>
  );
}

function CoverCanvasContent({
  layers,
  selectedLayerId,
  editingLayerId,
  onSelectLayer,
  onDragStart,
  onEditTextLayer,
  onTextLayerChange,
  onFinishEditing,
  onDeleteLayer,
  interactive = true,
}: {
  layers: CoverLayer[];
  selectedLayerId?: string;
  editingLayerId?: string;
  onSelectLayer?: (layerId: string) => void;
  onDragStart?: (event: ReactPointerEvent<HTMLButtonElement>, layer: CoverLayer) => void;
  onEditTextLayer?: (layerId: string) => void;
  onTextLayerChange?: (layerId: string, text: string) => void;
  onFinishEditing?: () => void;
  onDeleteLayer?: (layerId: string) => void;
  interactive?: boolean;
}) {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.45)_0_8%,transparent_9%),radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.36)_0_10%,transparent_11%)]" />
      {layers.map((layer) =>
        layer.type === "text" ? (
          <TextLayerView
            key={layerKey(layer)}
            layer={layer}
            selected={layer.id === selectedLayerId}
            editing={layer.id === editingLayerId}
            onSelect={() => onSelectLayer?.(layer.id)}
            onDragStart={onDragStart}
            onEditStart={() => onEditTextLayer?.(layer.id)}
            onTextChange={(text) => onTextLayerChange?.(layer.id, text)}
            onFinishEditing={onFinishEditing}
            onDelete={() => onDeleteLayer?.(layer.id)}
            interactive={interactive}
          />
        ) : (
          <IconLayerView
            key={layerKey(layer)}
            layer={layer}
            selected={layer.id === selectedLayerId}
            onSelect={() => onSelectLayer?.(layer.id)}
            onDragStart={onDragStart}
            onDelete={() => onDeleteLayer?.(layer.id)}
            interactive={interactive}
          />
        ),
      )}
    </>
  );
}

export function CoverEditor() {
  const [channelId, setChannelId] = useState<CoverChannelId>("xiaohongshu");
  const templates = useMemo(() => getTemplatesByChannel(channelId), [channelId]);
  const [templateId, setTemplateId] = useState(templates[0].id);
  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? templates[0],
    [templateId, templates],
  );
  const [layers, setLayers] = useState<CoverLayer[]>(() => cloneTemplateLayers(activeTemplate));
  const [selectedLayerId, setSelectedLayerId] = useState(layers[0]?.id ?? "");
  const [message, setMessage] = useState("拖拽调整位置。");
  const [isExporting, setIsExporting] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState(() => defaultCanvasScale("xiaohongshu"));
  const canvasRef = useRef<HTMLDivElement>(null);
  const exportCanvasRef = useRef<HTMLDivElement>(null);
  const channel = getChannel(channelId);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId) ?? null;

  const chooseChannel = (nextChannelId: CoverChannelId) => {
    const nextTemplate = getTemplatesByChannel(nextChannelId)[0];
    setChannelId(nextChannelId);
    setTemplateId(nextTemplate.id);
    const nextLayers = cloneTemplateLayers(nextTemplate);
    setLayers(nextLayers);
    setSelectedLayerId(nextLayers[0]?.id ?? "");
    setCanvasScale(defaultCanvasScale(nextChannelId));
    setMessage(`已切换到${getChannel(nextChannelId).name}。`);
  };

  const chooseTemplate = (nextTemplateId: string) => {
    const nextTemplate = templates.find((template) => template.id === nextTemplateId);
    if (!nextTemplate) return;
    const nextLayers = cloneTemplateLayers(nextTemplate);
    setTemplateId(nextTemplate.id);
    setLayers(nextLayers);
    setSelectedLayerId(nextLayers[0]?.id ?? "");
    setMessage(`已套用「${nextTemplate.name}」。`);
  };

  const patchSelectedLayer = <T extends CoverLayer>(patch: Partial<T>) => {
    if (!selectedLayer) return;
    patchLayer<T>(selectedLayer.id, patch);
  };

  const patchLayer = <T extends CoverLayer>(layerId: string, patch: Partial<T>) => {
    setLayers((currentLayers) => updateLayer<T>(currentLayers, layerId, patch));
  };

  const addTextLayer = () => {
    const layer = createTextLayer("新的封面标题");
    setLayers((currentLayers) => [...currentLayers, layer]);
    setSelectedLayerId(layer.id);
    setMessage("已添加文字。");
  };

  const addIconLayer = (iconId: BrandIconId) => {
    const layer = createIconLayer(iconId);
    setLayers((currentLayers) => [...currentLayers, layer]);
    setSelectedLayerId(layer.id);
    setMessage(`已添加 ${findBrandIcon(iconId).name} 图标。`);
  };

  const deleteLayer = (layerId: string) => {
    setLayers((currentLayers) => {
      const nextLayers = currentLayers.filter((layer) => layer.id !== layerId);
      setSelectedLayerId(nextLayers[0]?.id ?? "");
      return nextLayers;
    });
    setEditingLayerId(null);
  };

  const beginDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    layer: CoverLayer,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedLayerId(layer.id);
    setEditingLayerId(null);
    setDragState({
      layerId: layer.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layer.x,
      startY: layer.y,
    });
  };

  const moveDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragState || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = ((event.clientX - dragState.startClientX) / rect.width) * 100;
      const deltaY = ((event.clientY - dragState.startClientY) / rect.height) * 100;
      const draggedLayer = layers.find((layer) => layer.id === dragState.layerId);
      const maxX =
        draggedLayer?.type === "icon"
          ? 100 - draggedLayer.size
          : 100 - (draggedLayer?.width ?? 20);
      setLayers((currentLayers) =>
        updateLayer(currentLayers, dragState.layerId, {
          x: clamp(dragState.startX + deltaX, 0, Math.max(0, maxX)),
          y: clamp(dragState.startY + deltaY, 0, 92),
        }),
      );
    },
    [dragState, layers],
  );

  const handlePreviewWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setCanvasScale((currentScale) =>
      Number(
        clamp(
          currentScale + direction * CANVAS_ZOOM_STEP,
          MIN_CANVAS_SCALE,
          MAX_CANVAS_SCALE,
        ).toFixed(2),
      ),
    );
  };

  const exportCover = async () => {
    if (!exportCanvasRef.current) return;
    setIsExporting(true);
    setMessage("正在导出封面...");
    try {
      await downloadNodeAsPng(exportCanvasRef.current, `cover-${channel.id}.png`);
      setMessage("封面已导出。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  const finishEditingIfOutsideTextEditor = (target: EventTarget | null) => {
    if (!editingLayerId || !(target instanceof HTMLElement)) return;
    if (target.closest("[data-cover-text-editor='true']")) return;
    setEditingLayerId(null);
  };

  const handlePointerDownCapture = (event: ReactPointerEvent<HTMLElement>) => {
    finishEditingIfOutsideTextEditor(event.target);
  };

  const handleFocusCapture = (event: ReactFocusEvent<HTMLElement>) => {
    finishEditingIfOutsideTextEditor(event.target);
  };

  const canvasStyle: CSSProperties = {
    width: `${channel.width}px`,
    height: `${channel.height}px`,
    transform: `scale(${canvasScale})`,
    transformOrigin: "top left",
  };
  const pageStyle = {
    "--cover-accent": channel.brandColor,
    "--cover-accent-ink": channel.brandForeground,
  } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-[#f6f7f9] p-4 text-zinc-950 md:p-6"
      style={pageStyle}
      onPointerDownCapture={handlePointerDownCapture}
      onFocusCapture={handleFocusCapture}
    >
      <div className="mx-auto flex max-w-[1560px] flex-col gap-4">
        <header className="flex flex-wrap items-center justify-end gap-2 rounded-[24px] border-3 border-zinc-950 bg-white p-4 shadow-[6px_6px_0_#18181b]">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-full border-3 border-zinc-950 bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_#18181b] transition hover:-translate-y-0.5"
            >
              回 Markdown 转图
            </Link>
            <button
              type="button"
              onClick={exportCover}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-full border-3 border-zinc-950 bg-[var(--cover-accent)] px-4 py-2 text-sm font-black text-[var(--cover-accent-ink)] shadow-[3px_3px_0_#18181b] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              <Download size={17} aria-hidden="true" />
              {isExporting ? "导出中..." : "导出 PNG"}
            </button>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[300px_minmax(520px,1fr)_320px]">
          <aside className="flex flex-col gap-4 rounded-[24px] border-3 border-zinc-950 bg-white p-4 shadow-[6px_6px_0_#18181b]">
            <section>
              <h2 className="mb-3 text-lg font-black">平台</h2>
              <div className="grid grid-cols-2 gap-2">
                {COVER_CHANNELS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === channelId}
                    onClick={() => chooseChannel(item.id)}
                    style={
                      {
                        "--channel-color": item.brandColor,
                        "--channel-ink": item.brandForeground,
                      } as CSSProperties
                    }
                    className={[
                      "rounded-2xl border-3 px-3 py-3 text-left text-sm font-black shadow-[3px_3px_0_#18181b] transition hover:-translate-y-0.5",
                      item.id === channelId
                        ? "border-zinc-950 bg-[var(--channel-color)] text-[var(--channel-ink)]"
                        : "border-[var(--channel-color)] bg-white text-zinc-950",
                    ].join(" ")}
                  >
                    {item.name}
                    <span
                      className={[
                        "mt-1 block text-xs font-bold",
                        item.id === channelId ? "text-white/80" : "text-zinc-500",
                      ].join(" ")}
                    >
                      {item.sizeLabel}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-black">模板</h2>
                <span className="rounded-full bg-zinc-950 px-2 py-1 text-xs font-black text-white">
                  {templates.length} 款
                </span>
              </div>
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    aria-pressed={template.id === activeTemplate.id}
                    onClick={() => chooseTemplate(template.id)}
                    className={[
                      "w-full rounded-2xl border-3 border-zinc-950 p-3 text-left shadow-[3px_3px_0_#18181b] transition hover:-translate-y-0.5",
                      template.id === activeTemplate.id
                        ? "bg-[color-mix(in_srgb,var(--cover-accent)_16%,white)]"
                        : "bg-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mb-2 block h-16 rounded-xl border-2 border-zinc-950",
                        template.backgroundClassName,
                      ].join(" ")}
                    />
                    <span className="block font-black">{template.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-black">添加</h2>
              <button
                type="button"
                onClick={addTextLayer}
                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-3 border-zinc-950 bg-[var(--cover-accent)] px-3 py-3 font-black text-[var(--cover-accent-ink)] shadow-[3px_3px_0_#18181b]"
              >
                <Plus size={18} aria-hidden="true" />
                添加文字
              </button>
              <div className="grid grid-cols-2 gap-2">
                {BRAND_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    aria-label={`添加 ${icon.name} 图标`}
                    onClick={() => addIconLayer(icon.id)}
                    className="rounded-2xl border-2 border-zinc-950 bg-zinc-50 p-2 text-sm font-black transition hover:bg-sky-100"
                  >
                    <span
                      className={[
                        "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-xs",
                        icon.className,
                      ].join(" ")}
                    >
                      {icon.mark}
                    </span>
                    {icon.name}
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <section
            aria-label="封面预览面板"
            onWheel={handlePreviewWheel}
            className="min-w-0 rounded-[24px] border-3 border-zinc-950 bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px),#eef2ff] bg-[length:28px_28px] p-3 shadow-[6px_6px_0_#18181b]"
          >
            <div className="flex min-h-[600px] items-center justify-center overflow-auto rounded-2xl border-3 border-zinc-950 bg-white/70 p-3">
              <div
                className="relative"
                style={{
                  width: `${channel.width * canvasScale}px`,
                  height: `${channel.height * canvasScale}px`,
                }}
              >
                <div
                  ref={canvasRef}
                  aria-label="封面画布"
                  onPointerMove={moveDrag}
                  onPointerUp={() => setDragState(null)}
                  onPointerCancel={() => setDragState(null)}
                  className={[
                    "absolute left-0 top-0 overflow-hidden rounded-[64px] border-[10px] border-zinc-950 shadow-2xl",
                    activeTemplate.backgroundClassName,
                  ].join(" ")}
                  style={canvasStyle}
                >
                  <CoverCanvasContent
                    layers={layers}
                    selectedLayerId={selectedLayerId}
                    editingLayerId={editingLayerId ?? undefined}
                    onSelectLayer={setSelectedLayerId}
                    onDragStart={beginDrag}
                    onEditTextLayer={(layerId) => {
                      setSelectedLayerId(layerId);
                      setEditingLayerId(layerId);
                    }}
                    onTextLayerChange={(layerId, text) =>
                      patchLayer<CoverTextLayer>(layerId, { text })
                    }
                    onFinishEditing={() => setEditingLayerId(null)}
                    onDeleteLayer={deleteLayer}
                  />
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[24px] border-3 border-zinc-950 bg-white p-4 shadow-[6px_6px_0_#18181b]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black">编辑</h2>
              <span className="rounded-full bg-[color-mix(in_srgb,var(--cover-accent)_14%,white)] px-2 py-1 text-xs font-black text-zinc-950">
                {selectedLayer?.type === "text" ? "文字" : selectedLayer ? "图标" : "未选择"}
              </span>
            </div>

            {!selectedLayer && (
              <div className="rounded-3xl border-3 border-dashed border-zinc-300 p-6 text-center font-bold text-zinc-500">
                选择画布里的文字或图标后，可以在这里编辑。
              </div>
            )}

            {selectedLayer?.type === "text" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="mb-2 block text-sm font-black">字号</span>
                    <input
                      aria-label="字号"
                      type="number"
                      min={18}
                      max={180}
                      value={selectedLayer.fontSize}
                      onChange={(event) =>
                        patchSelectedLayer<CoverTextLayer>({
                          fontSize: Number(event.target.value),
                        })
                      }
                      className="w-full rounded-2xl border-3 border-zinc-950 bg-white p-2 font-black"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-black">文字颜色</span>
                    <input
                      aria-label="文字颜色"
                      type="color"
                      value={selectedLayer.color}
                      onChange={(event) =>
                        patchSelectedLayer<CoverTextLayer>({ color: event.target.value })
                      }
                      className="h-12 w-full rounded-2xl border-3 border-zinc-950 bg-white p-1"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-black">字体</span>
                  <select
                    aria-label="字体"
                    value={selectedLayer.fontFamily}
                    onChange={(event) =>
                      patchSelectedLayer<CoverTextLayer>({
                        fontFamily: event.target.value as CoverTextLayer["fontFamily"],
                      })
                    }
                    className="w-full rounded-2xl border-3 border-zinc-950 bg-white p-3 font-black"
                  >
                    {COVER_FONT_FAMILIES.map((font) => (
                      <option key={font.id} value={font.id}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "加粗", icon: Bold, patch: { bold: !selectedLayer.bold } },
                    { label: "斜体", icon: Italic, patch: { italic: !selectedLayer.italic } },
                    {
                      label: "下划线",
                      icon: Underline,
                      patch: { underline: !selectedLayer.underline },
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => patchSelectedLayer<CoverTextLayer>(item.patch)}
                        className="inline-flex items-center justify-center gap-1 rounded-2xl border-2 border-zinc-950 bg-zinc-50 px-2 py-2 text-sm font-black hover:bg-[#fef15a]"
                      >
                        <Icon size={15} aria-hidden="true" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "左对齐", icon: AlignLeft, align: "left" as const },
                    { label: "居中", icon: AlignCenter, align: "center" as const },
                    { label: "右对齐", icon: AlignRight, align: "right" as const },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        aria-pressed={selectedLayer.align === item.align}
                        onClick={() =>
                          patchSelectedLayer<CoverTextLayer>({ align: item.align })
                        }
                        className={[
                          "inline-flex items-center justify-center gap-1 rounded-2xl border-2 border-zinc-950 px-2 py-2 text-sm font-black",
                          selectedLayer.align === item.align ? "bg-sky-200" : "bg-zinc-50",
                        ].join(" ")}
                      >
                        <Icon size={15} aria-hidden="true" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedLayer?.type === "icon" && (
              <div className="space-y-4">
                <div className="rounded-3xl border-3 border-zinc-950 bg-zinc-50 p-4">
                  <Type size={20} aria-hidden="true" />
                  <p className="mt-2 font-black">{findBrandIcon(selectedLayer.iconId).name}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-600">
                    可拖拽定位。
                  </p>
                </div>
                <label>
                  <span className="mb-2 block text-sm font-black">图标大小</span>
                  <input
                    aria-label="图标大小"
                    type="range"
                    min={6}
                    max={24}
                    value={selectedLayer.size}
                    onChange={(event) =>
                      patchSelectedLayer<CoverIconLayer>({
                        size: Number(event.target.value),
                      })
                    }
                    className="w-full accent-fuchsia-600"
                  />
                </label>
              </div>
            )}

          </aside>
        </div>

        <div className="export-pages" aria-hidden="true">
          <div
            ref={exportCanvasRef}
            className={[
              "cover-export-node relative overflow-hidden",
              activeTemplate.backgroundClassName,
            ].join(" ")}
            style={{
              width: `${channel.width}px`,
              height: `${channel.height}px`,
            }}
          >
            <CoverCanvasContent layers={layers} interactive={false} />
          </div>
        </div>
      </div>
    </main>
  );
}
