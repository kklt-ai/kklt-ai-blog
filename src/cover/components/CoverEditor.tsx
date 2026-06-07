"use client";

import {
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BRAND_ICONS,
  type BrandIconId,
  type CoverChannelId,
  type CoverLayer,
  type CoverTextLayer,
  cloneTemplateLayers,
  createIconLayer,
  createTextLayer,
  getBackgroundImagesByChannel,
  getChannel,
  getTemplatesByChannel,
  updateLayer,
} from "@/cover/lib/cover";
import { downloadCoverNodeAsPng } from "@/cover/lib/export";
import { CoverSettingsPanel } from "./CoverSettingsPanel";
import { CoverToolPanel } from "./CoverToolPanel";
import { CoverTopNav } from "./CoverTopNav";
import { CoverExportCanvas, CoverPreviewPanel } from "./CoverPreviewPanel";
import type {
  CoverBackgroundSelection,
  CoverBackgroundTabId,
  CoverToolId,
  DragState,
} from "./coverEditorTypes";
import type { TextEffectCategoryId } from "./textEffectOptions";

const CANVAS_ZOOM_STEP = 0.04;
const MIN_CANVAS_SCALE = 0.2;
const MAX_CANVAS_SCALE = 0.8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function defaultCanvasScale(channelId: CoverChannelId) {
  return channelId === "wechat" ? 0.56 : 0.36;
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
  const [activePreviewLayerId, setActivePreviewLayerId] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [activeToolId, setActiveToolId] = useState<CoverToolId>("templates");
  const [activeEffectCategoryId, setActiveEffectCategoryId] =
    useState<TextEffectCategoryId>("outline");
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

  const resetToTemplate = (nextChannelId: CoverChannelId, nextTemplateId: string) => {
    const nextTemplate = getTemplatesByChannel(nextChannelId).find(
      (template) => template.id === nextTemplateId,
    );
    if (!nextTemplate) return;
    const nextLayers = cloneTemplateLayers(nextTemplate);
    setTemplateId(nextTemplate.id);
    setLayers(nextLayers);
    setSelectedLayerId(nextLayers[0]?.id ?? "");
    setActivePreviewLayerId("");
    setSelectedBackground({
      kind: "color",
      id: nextTemplate.id,
      className: nextTemplate.backgroundClassName,
    });
  };

  const chooseChannel = (nextChannelId: CoverChannelId) => {
    const nextTemplate = getTemplatesByChannel(nextChannelId)[0];
    setChannelId(nextChannelId);
    resetToTemplate(nextChannelId, nextTemplate.id);
    setCanvasScale(defaultCanvasScale(nextChannelId));
  };

  const chooseTemplate = (nextTemplateId: string) => {
    resetToTemplate(channelId, nextTemplateId);
  };

  const patchLayer = <T extends CoverLayer>(layerId: string, patch: Partial<T>) => {
    setLayers((currentLayers) => updateLayer<T>(currentLayers, layerId, patch));
  };

  const patchSelectedLayer = <T extends CoverLayer>(patch: Partial<T>) => {
    if (!selectedLayer) return;
    patchLayer<T>(selectedLayer.id, patch);
  };

  const addTextLayer = () => {
    const layer = createTextLayer("新的封面标题");
    setLayers((currentLayers) => [...currentLayers, layer]);
    setSelectedLayerId(layer.id);
    setActivePreviewLayerId(layer.id);
  };

  const addIconLayer = (iconId: BrandIconId) => {
    const layer = createIconLayer(iconId);
    setLayers((currentLayers) => [...currentLayers, layer]);
    setSelectedLayerId(layer.id);
    setActivePreviewLayerId(layer.id);
  };

  const deleteLayer = (layerId: string) => {
    setLayers((currentLayers) => {
      const nextLayers = currentLayers.filter((layer) => layer.id !== layerId);
      setSelectedLayerId(nextLayers[0]?.id ?? "");
      setActivePreviewLayerId("");
      return nextLayers;
    });
    setEditingLayerId(null);
  };

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>, layer: CoverLayer) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedLayerId(layer.id);
    setActivePreviewLayerId(layer.id);
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
    try {
      await downloadCoverNodeAsPng(exportCanvasRef.current, channel.id);
    } finally {
      setIsExporting(false);
    }
  };

  const finishEditingIfOutsideTextEditor = (target: EventTarget | null) => {
    if (!editingLayerId || !(target instanceof HTMLElement)) return;
    if (target.closest("[data-cover-text-editor='true']")) return;
    setEditingLayerId(null);
  };

  const clearPreviewActiveLayerIfOutsideLayer = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("[data-cover-layer='true']")) return;
    setActivePreviewLayerId("");
  };

  const handlePointerDownCapture = (event: ReactPointerEvent<HTMLElement>) => {
    finishEditingIfOutsideTextEditor(event.target);
    clearPreviewActiveLayerIfOutsideLayer(event.target);
  };

  const handleFocusCapture = (event: ReactFocusEvent<HTMLElement>) => {
    finishEditingIfOutsideTextEditor(event.target);
    clearPreviewActiveLayerIfOutsideLayer(event.target);
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
  const pageStyle = {
    "--cover-accent": channel.brandColor,
    "--cover-accent-ink": channel.brandForeground,
  } as CSSProperties;

  return (
    <main
      className="flex min-h-screen flex-col bg-[#f2f3f5] text-zinc-950 xl:h-screen xl:overflow-hidden"
      style={pageStyle}
      onPointerDownCapture={handlePointerDownCapture}
      onFocusCapture={handleFocusCapture}
    >
      <CoverTopNav
        channel={channel}
        channelId={channelId}
        isExporting={isExporting}
        onChooseChannel={chooseChannel}
        onExportCover={exportCover}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(360px,430px)_minmax(420px,1fr)_minmax(380px,420px)] max-xl:grid-cols-1">
        <CoverToolPanel
          activeToolId={activeToolId}
          onActiveToolChange={setActiveToolId}
          templates={templates}
          activeTemplate={activeTemplate}
          onChooseTemplate={chooseTemplate}
          onAddTextLayer={addTextLayer}
          logoSearchInputRef={logoSearchInputRef}
          logoSearchQuery={logoSearchQuery}
          onLogoSearchQueryChange={setLogoSearchQuery}
          filteredBrandIcons={filteredBrandIcons}
          onAddIconLayer={addIconLayer}
          channelId={channel.id}
          backgroundTabId={backgroundTabId}
          onBackgroundTabChange={setBackgroundTabId}
          backgroundImages={backgroundImages}
          selectedBackground={selectedBackground}
          onSelectedBackgroundChange={setSelectedBackground}
        />
        <CoverPreviewPanel
          canvasRef={canvasRef}
          channelWidth={channel.width}
          channelHeight={channel.height}
          canvasScale={canvasScale}
          canvasStyle={canvasStyle}
          selectedBackground={selectedBackground}
          selectedBackgroundClassName={selectedBackgroundClassName}
          selectedBackgroundStyle={selectedBackgroundStyle}
          layers={layers}
          selectedLayerId={activePreviewLayerId}
          editingLayerId={editingLayerId}
          onWheel={handlePreviewWheel}
          onPointerMove={moveDrag}
          onPointerEnd={() => setDragState(null)}
          onSelectLayer={(layerId) => {
            setSelectedLayerId(layerId);
            setActivePreviewLayerId(layerId);
          }}
          onBeginDrag={beginDrag}
          onEditTextLayer={(layerId) => {
            setSelectedLayerId(layerId);
            setActivePreviewLayerId(layerId);
            setEditingLayerId(layerId);
          }}
          onTextLayerChange={(layerId, text) => patchLayer<CoverTextLayer>(layerId, { text })}
          onFinishEditing={() => setEditingLayerId(null)}
          onDeleteLayer={deleteLayer}
        />
        <CoverSettingsPanel
          selectedLayer={selectedLayer}
          activeEffectCategoryId={activeEffectCategoryId}
          onActiveEffectCategoryChange={setActiveEffectCategoryId}
          patchSelectedLayer={patchSelectedLayer}
        />
        <CoverExportCanvas
          exportCanvasRef={exportCanvasRef}
          channelWidth={channel.width}
          channelHeight={channel.height}
          selectedBackground={selectedBackground}
          selectedBackgroundClassName={selectedBackgroundClassName}
          selectedBackgroundStyle={selectedBackgroundStyle}
          layers={layers}
        />
      </div>
    </main>
  );
}
