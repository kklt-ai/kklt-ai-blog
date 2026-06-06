"use client";

import Link from "next/link";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Italic,
  LayoutTemplate,
  Paintbrush,
  Plus,
  Search,
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
import { downloadCoverNodeAsPng } from "@/cover/lib/export";
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
  getBackgroundImagesByChannel,
  getChannel,
  getTemplatesByChannel,
  updateLayer,
} from "@/cover/lib/cover";

type DragState = {
  layerId: string;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
};

type CoverToolId = "templates" | "text" | "image" | "background";
type CoverBackgroundTabId = "image" | "color";
type CoverBackgroundSelection =
  | { kind: "image"; id: string; src: string }
  | { kind: "color"; id: string; className: string };

const COVER_TOOLS: Array<{
  id: CoverToolId;
  label: string;
  icon: typeof LayoutTemplate;
}> = [
  { id: "templates", label: "模板", icon: LayoutTemplate },
  { id: "text", label: "文字", icon: Type },
  { id: "image", label: "图片", icon: ImageIcon },
  { id: "background", label: "背景", icon: Paintbrush },
];

const CANVAS_ZOOM_STEP = 0.04;
const MIN_CANVAS_SCALE = 0.2;
const MAX_CANVAS_SCALE = 0.8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function defaultCanvasScale(channelId: CoverChannelId) {
  return channelId === "wechat" ? 0.56 : 0.36;
}

function backgroundPreviewAspectClassName(channelId: CoverChannelId) {
  return channelId === "wechat" ? "aspect-[1200/628]" : "aspect-[3/4]";
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
        {icon.src ? (
          <img
            src={icon.src}
            alt={`${icon.name} logo`}
            className="h-[72%] w-[72%] object-contain"
            draggable={false}
          />
        ) : (
          icon.mark
        )}
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
        {icon.src ? (
          <img
            src={icon.src}
            alt={`${icon.name} logo`}
            className="h-[72%] w-[72%] object-contain"
            draggable={false}
          />
        ) : (
          icon.mark
        )}
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
  showBackgroundDecorations = true,
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
  showBackgroundDecorations?: boolean;
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
      {showBackgroundDecorations && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.45)_0_8%,transparent_9%),radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.36)_0_10%,transparent_11%)]" />
      )}
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
  const backgroundImages = useMemo(
    () => getBackgroundImagesByChannel(channelId),
    [channelId],
  );
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
  const [activeToolId, setActiveToolId] = useState<CoverToolId>("templates");
  const [backgroundTabId, setBackgroundTabId] = useState<CoverBackgroundTabId>("image");
  const [logoSearchQuery, setLogoSearchQuery] = useState("");
  const [selectedBackground, setSelectedBackground] = useState<CoverBackgroundSelection>(() => ({
    kind: "color",
    id: activeTemplate.id,
    className: activeTemplate.backgroundClassName,
  }));
  const [canvasScale, setCanvasScale] = useState(() => defaultCanvasScale("xiaohongshu"));
  const canvasRef = useRef<HTMLDivElement>(null);
  const exportCanvasRef = useRef<HTMLDivElement>(null);
  const logoSearchInputRef = useRef<HTMLInputElement>(null);
  const channel = getChannel(channelId);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId) ?? null;
  const filteredBrandIcons = useMemo(() => {
    const keyword = logoSearchQuery.trim().toLowerCase();
    if (!keyword) return BRAND_ICONS;
    return BRAND_ICONS.filter((icon) =>
      `${icon.name} ${icon.id}`.toLowerCase().includes(keyword),
    );
  }, [logoSearchQuery]);

  const chooseChannel = (nextChannelId: CoverChannelId) => {
    const nextTemplate = getTemplatesByChannel(nextChannelId)[0];
    setChannelId(nextChannelId);
    setTemplateId(nextTemplate.id);
    const nextLayers = cloneTemplateLayers(nextTemplate);
    setLayers(nextLayers);
    setSelectedLayerId(nextLayers[0]?.id ?? "");
    setSelectedBackground({
      kind: "color",
      id: nextTemplate.id,
      className: nextTemplate.backgroundClassName,
    });
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
    setSelectedBackground({
      kind: "color",
      id: nextTemplate.id,
      className: nextTemplate.backgroundClassName,
    });
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
      await downloadCoverNodeAsPng(exportCanvasRef.current, channel.id);
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
  const selectedBackgroundClassName =
    selectedBackground.kind === "color" ? selectedBackground.className : "";
  const selectedBackgroundStyle: CSSProperties =
    selectedBackground.kind === "image"
      ? {
          backgroundImage: `url(${selectedBackground.src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }
      : {};
  const backgroundPreviewAspectClassNameValue = backgroundPreviewAspectClassName(channel.id);
  const pageStyle = {
    "--cover-accent": channel.brandColor,
    "--cover-accent-ink": channel.brandForeground,
  } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-[#f2f3f5] text-zinc-950 xl:h-screen xl:overflow-hidden"
      style={pageStyle}
      onPointerDownCapture={handlePointerDownCapture}
      onFocusCapture={handleFocusCapture}
    >
      <div className="grid min-h-screen grid-cols-[minmax(360px,430px)_minmax(420px,1fr)_330px] max-xl:grid-cols-1 xl:h-full xl:min-h-0">
        <aside className="flex min-h-0 border-r border-zinc-200 bg-white max-xl:min-h-[520px] max-sm:flex-col xl:h-full">
          <nav
            aria-label="封面功能栏"
            className="flex w-[88px] shrink-0 flex-col gap-2 border-r border-zinc-200 px-3 py-5 max-sm:w-full max-sm:flex-row max-sm:border-b max-sm:border-r-0"
          >
            {COVER_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.id === activeToolId;
              return (
                <button
                  key={tool.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveToolId(tool.id)}
                  className={[
                    "flex h-[72px] flex-col items-center justify-center gap-1 rounded-lg text-sm font-semibold transition max-sm:h-14 max-sm:flex-1",
                    isActive
                      ? "bg-zinc-100 text-zinc-950"
                      : "bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
                  ].join(" ")}
                >
                  <Icon size={23} aria-hidden="true" strokeWidth={2.1} />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="min-h-0 flex-1 overflow-hidden px-5 py-5">
            {activeToolId === "templates" && (
              <section className="h-full overflow-y-auto pr-1">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold">模板</h2>
                  <span className="text-sm font-semibold text-zinc-500">
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
                        "w-full rounded-lg border p-3 text-left transition",
                        template.id === activeTemplate.id
                          ? "border-zinc-950 bg-zinc-50"
                          : "border-zinc-200 bg-white hover:border-zinc-300",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mb-2 block h-20 rounded-md border border-zinc-200",
                          template.backgroundClassName,
                        ].join(" ")}
                      />
                      <span className="block font-semibold">{template.name}</span>
                      <span className="mt-1 block text-xs leading-5 text-zinc-500">
                        {template.description}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {activeToolId === "text" && (
              <section className="h-full overflow-y-auto pr-1">
                <h2 className="mb-5 text-xl font-bold">文字</h2>
                <button
                  type="button"
                  onClick={addTextLayer}
                  className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-3 py-3 font-semibold text-white transition hover:bg-zinc-800"
                >
                  <Plus size={18} aria-hidden="true" />
                  添加文字
                </button>
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-zinc-100 p-3">
                  {[
                    { label: "标题", sample: "H1" },
                    { label: "副标题", sample: "H2" },
                    { label: "正文", sample: "Aa" },
                    { label: "强调", sample: "abc" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={addTextLayer}
                      className="rounded-md bg-white px-3 py-4 text-center text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
                    >
                      <span className="mb-2 block text-2xl font-bold text-zinc-950">
                        {item.sample}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {activeToolId === "image" && (
              <section className="flex h-full min-h-0 flex-col">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">图片素材</h2>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://icons.lobehub.com/"
                      target="_blank"
                      rel="noreferrer"
                      title="Logo下载网站"
                      aria-label="前往 LobeHub Icons 下载 Logo"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
                    >
                      <ExternalLink size={18} aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <input
                  ref={logoSearchInputRef}
                  type="search"
                  aria-label="搜索 Logo"
                  value={logoSearchQuery}
                  onChange={(event) => setLogoSearchQuery(event.target.value)}
                  placeholder="搜索 Logo"
                  className="mb-4 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold outline-none transition focus:border-zinc-400 focus:bg-white"
                />
                <div
                  aria-label="Logo 素材列表"
                  className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto overscroll-contain pr-1"
                >
                  {filteredBrandIcons.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      aria-label={`添加 ${icon.name} 图标`}
                      onClick={() => addIconLayer(icon.id)}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm font-semibold transition hover:border-zinc-300 hover:bg-white"
                    >
                      <span
                        className={[
                          "mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 text-xs",
                          icon.className,
                        ].join(" ")}
                      >
                        {icon.src ? (
                          <img
                            src={icon.src}
                            alt={`${icon.name} logo`}
                            className="h-7 w-7 object-contain"
                            draggable={false}
                          />
                        ) : (
                          icon.mark
                        )}
                      </span>
                      {icon.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {activeToolId === "background" && (
              <section className="h-full overflow-y-auto pr-1">
                <h2 className="mb-5 text-xl font-bold">背景样式</h2>
                <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1">
                  {[
                    { id: "image" as const, label: "图片背景" },
                    { id: "color" as const, label: "颜色背景" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={backgroundTabId === tab.id}
                      onClick={() => setBackgroundTabId(tab.id)}
                      className={[
                        "rounded-md px-3 py-2 text-sm font-bold transition",
                        backgroundTabId === tab.id
                          ? "bg-white text-zinc-950 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-950",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {backgroundTabId === "image" &&
                    backgroundImages.map((background) => (
                      <button
                        key={background.id}
                        type="button"
                        aria-label={`使用 ${background.name} 背景`}
                        aria-pressed={
                          selectedBackground.kind === "image" &&
                          selectedBackground.id === background.id
                        }
                        onClick={() =>
                          setSelectedBackground({
                            kind: "image",
                            id: background.id,
                            src: background.src,
                          })
                        }
                        className={[
                          "rounded-lg border bg-white p-2 text-left transition",
                          selectedBackground.kind === "image" &&
                          selectedBackground.id === background.id
                            ? "border-zinc-950"
                            : "border-zinc-200 hover:border-zinc-300",
                        ].join(" ")}
                      >
                        <img
                          src={background.src}
                          alt={`${background.name}背景预览`}
                          className={[
                            "block w-full rounded-md object-cover",
                            backgroundPreviewAspectClassNameValue,
                          ].join(" ")}
                        />
                        <span className="mt-2 block truncate text-sm font-semibold">
                          {background.name}
                        </span>
                      </button>
                    ))}

                  {backgroundTabId === "color" &&
                    templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        aria-label={`使用 ${template.name} 背景`}
                        aria-pressed={
                          selectedBackground.kind === "color" &&
                          selectedBackground.id === template.id
                        }
                        onClick={() =>
                          setSelectedBackground({
                            kind: "color",
                            id: template.id,
                            className: template.backgroundClassName,
                          })
                        }
                        className={[
                          "rounded-lg border bg-white p-2 text-left transition",
                          selectedBackground.kind === "color" &&
                          selectedBackground.id === template.id
                            ? "border-zinc-950"
                            : "border-zinc-200 hover:border-zinc-300",
                        ].join(" ")}
                      >
                        <span
                          role="img"
                          aria-label={`${template.name}背景预览`}
                          className={[
                            "block w-full rounded-md",
                            backgroundPreviewAspectClassNameValue,
                            template.backgroundClassName,
                          ].join(" ")}
                        />
                        <span className="mt-2 block truncate text-sm font-semibold">
                          {template.name}
                        </span>
                      </button>
                    ))}
                </div>
              </section>
            )}
          </div>
        </aside>

          <section
            aria-label="封面预览面板"
            onWheel={handlePreviewWheel}
            className="min-w-0 bg-[#f2f3f5] p-6 max-sm:p-3"
          >
            <div className="flex min-h-[calc(100vh-48px)] items-center justify-center overflow-auto p-3 max-xl:min-h-[720px]">
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
                    "absolute left-0 top-0 overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.18)]",
                    selectedBackgroundClassName,
                  ].join(" ")}
                  style={{ ...canvasStyle, ...selectedBackgroundStyle }}
                >
                  <CoverCanvasContent
                    layers={layers}
                    selectedLayerId={selectedLayerId}
                    editingLayerId={editingLayerId ?? undefined}
                    showBackgroundDecorations={selectedBackground.kind === "color"}
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

          <aside className="border-l border-zinc-200 bg-white px-5 py-5 max-xl:border-l-0 max-xl:border-t">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">画板</h2>
              <Link href="/" className="text-sm font-semibold text-zinc-500 hover:text-zinc-950">
                返回
              </Link>
            </div>

            <section className="border-b border-zinc-100 pb-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">尺寸</h3>
                <span className="font-semibold text-zinc-500">
                  {channel.width} × {channel.height} px
                </span>
              </div>
              <button
                type="button"
                onClick={exportCover}
                disabled={isExporting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                <Download size={17} aria-hidden="true" />
                {isExporting ? "导出中..." : "导出 PNG"}
              </button>
            </section>

            <section className="border-b border-zinc-100 py-5">
              <h3 className="mb-3 font-bold">平台</h3>
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
                      "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                      item.id === channelId
                        ? "border-[var(--channel-color)] bg-[var(--channel-color)] text-[var(--channel-ink)]"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-white",
                    ].join(" ")}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="py-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">编辑</h3>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
                {selectedLayer?.type === "text" ? "文字" : selectedLayer ? "图标" : "未选择"}
              </span>
              </div>

            {!selectedLayer && (
              <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center font-semibold text-zinc-500">
                选择画布里的文字或图标后，可以在这里编辑。
              </div>
            )}

            {selectedLayer?.type === "text" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="mb-2 block text-sm font-bold">字号</span>
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
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2 font-semibold"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold">文字颜色</span>
                    <input
                      aria-label="文字颜色"
                      type="color"
                      value={selectedLayer.color}
                      onChange={(event) =>
                        patchSelectedLayer<CoverTextLayer>({ color: event.target.value })
                      }
                      className="h-11 w-full rounded-lg border border-zinc-200 bg-white p-1"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">字体</span>
                  <select
                    aria-label="字体"
                    value={selectedLayer.fontFamily}
                    onChange={(event) =>
                      patchSelectedLayer<CoverTextLayer>({
                        fontFamily: event.target.value as CoverTextLayer["fontFamily"],
                      })
                    }
                    className="w-full rounded-lg border border-zinc-200 bg-white p-3 font-semibold"
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
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm font-semibold hover:bg-white"
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
                          "inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-sm font-semibold",
                          selectedLayer.align === item.align
                            ? "border-zinc-950 bg-zinc-950 text-white"
                            : "border-zinc-200 bg-zinc-50",
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
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <Type size={20} aria-hidden="true" />
                  <p className="mt-2 font-bold">{findBrandIcon(selectedLayer.iconId).name}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-500">
                    可拖拽定位。
                  </p>
                </div>
                <label>
                  <span className="mb-2 block text-sm font-bold">图标大小</span>
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

            </section>
          </aside>

        <div
          className="export-pages pointer-events-none fixed -left-[10000px] top-0"
          aria-hidden="true"
        >
          <div
            ref={exportCanvasRef}
            className={[
              "cover-export-node relative overflow-hidden",
              selectedBackgroundClassName,
            ].join(" ")}
            style={{
              width: `${channel.width}px`,
              height: `${channel.height}px`,
              ...selectedBackgroundStyle,
            }}
          >
            <CoverCanvasContent
              layers={layers}
              interactive={false}
              showBackgroundDecorations={selectedBackground.kind === "color"}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
