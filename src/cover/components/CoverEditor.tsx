"use client";

import {
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BRAND_ICONS,
  type BrandIconId,
  type CoverChannelId,
  type CoverLayer,
  type CoverTemplate,
  type CoverTextLayer,
  cloneTemplateLayers,
  createIconLayer,
  createTextLayer,
  getBackgroundImagesByChannel,
  getChannel,
  getTemplatesByChannel,
  updateLayer,
} from "@/cover/lib/cover";
import {
  createCustomTemplateFromCover,
  findDuplicateTemplate,
  loadCustomTemplates,
  saveCustomTemplate,
  templateToConfigText,
} from "@/cover/lib/customTemplates";
import { downloadCoverNodeAsPng } from "@/cover/lib/export";
import { snapLayerToCanvasCenter } from "@/cover/lib/snapping";
import { CoverSettingsPanel } from "./CoverSettingsPanel";
import { CoverToolPanel } from "./CoverToolPanel";
import { CoverTopNav } from "./CoverTopNav";
import { CoverExportCanvas, CoverPreviewPanel } from "./CoverPreviewPanel";
import type {
  CoverBackgroundSelection,
  CoverBackgroundTabId,
  CoverToolId,
  CenterGuideState,
  DragState,
} from "./coverEditorTypes";
import type { TextEffectCategoryId } from "./textEffectOptions";

const CANVAS_ZOOM_STEP = 0.02;
const TEMPLATE_ACTION_MESSAGE_DURATION_MS = 2000;
const MIN_CANVAS_SCALE = 0.2;
const MAX_CANVAS_SCALE = 0.8;
const PASTED_TEXT_LAYER_OFFSET_Y = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function defaultCanvasScale(channelId: CoverChannelId) {
  return channelId === "wechat" ? 0.56 : 0.36;
}

function backgroundSelectionForTemplate(template: CoverTemplate): CoverBackgroundSelection {
  if (template.backgroundImageId) {
    const image = getBackgroundImagesByChannel(template.channel).find(
      (background) => background.id === template.backgroundImageId,
    );
    if (image) {
      return {
        kind: "image",
        id: image.id,
        src: image.src,
      };
    }
  }

  return {
    kind: "color",
    id: template.id,
    className: template.backgroundClassName,
  };
}

function loadBrowserCustomTemplates() {
  if (typeof window === "undefined") return [];
  return loadCustomTemplates(window.localStorage);
}

function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("[data-cover-text-editor='true']")) return true;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function copyTextWithFallback(text: string) {
  const fallbackCopy = () => {
    if (typeof document === "undefined") return;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("aria-hidden", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand?.("copy");
    textarea.remove();
  };

  if (!navigator.clipboard?.writeText) {
    fallbackCopy();
    return Promise.resolve();
  }

  return navigator.clipboard.writeText(text).catch(fallbackCopy);
}

export function CoverEditor() {
  const [channelId, setChannelId] = useState<CoverChannelId>("xiaohongshu");
  const [customTemplates, setCustomTemplates] = useState<CoverTemplate[]>(loadBrowserCustomTemplates);
  const presetTemplates = useMemo(() => getTemplatesByChannel(channelId), [channelId]);
  const templates = useMemo(
    () => [
      ...presetTemplates,
      ...customTemplates.filter((template) => template.channel === channelId),
    ],
    [channelId, customTemplates, presetTemplates],
  );
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
  const [centerGuides, setCenterGuides] = useState<CenterGuideState>({
    vertical: false,
    horizontal: false,
  });
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [activeToolId, setActiveToolId] = useState<CoverToolId>("templates");
  const [activeEffectCategoryId, setActiveEffectCategoryId] =
    useState<TextEffectCategoryId>("outline");
  const [backgroundTabId, setBackgroundTabId] = useState<CoverBackgroundTabId>("image");
  const [logoSearchQuery, setLogoSearchQuery] = useState("");
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [saveTemplateMessage, setSaveTemplateMessage] = useState("");
  const [templateActionMessage, setTemplateActionMessage] = useState("");
  const [selectedBackground, setSelectedBackground] = useState<CoverBackgroundSelection>(() => ({
    ...backgroundSelectionForTemplate(activeTemplate),
  }));
  const [canvasScale, setCanvasScale] = useState(() => defaultCanvasScale("xiaohongshu"));

  const canvasRef = useRef<HTMLDivElement>(null);
  const exportCanvasRef = useRef<HTMLDivElement>(null);
  const logoSearchInputRef = useRef<HTMLInputElement>(null);
  const copiedTextLayerRef = useRef<CoverTextLayer | null>(null);
  const layersRef = useRef<CoverLayer[]>(layers);
  const selectedLayerIdRef = useRef(selectedLayerId);
  const editingLayerIdRef = useRef(editingLayerId);
  const pastedLayerCounterRef = useRef(0);
  const channel = getChannel(channelId);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId) ?? null;
  layersRef.current = layers;
  selectedLayerIdRef.current = selectedLayerId;
  editingLayerIdRef.current = editingLayerId;
  const filteredBrandIcons = useMemo(() => {
    const keyword = logoSearchQuery.trim().toLowerCase();
    if (!keyword) return BRAND_ICONS;
    return BRAND_ICONS.filter((icon) =>
      `${icon.name} ${icon.id}`.toLowerCase().includes(keyword),
    );
  }, [logoSearchQuery]);

  const resetToTemplate = (nextChannelId: CoverChannelId, nextTemplateId: string) => {
    const nextTemplate = [
      ...getTemplatesByChannel(nextChannelId),
      ...customTemplates.filter((template) => template.channel === nextChannelId),
    ].find((template) => template.id === nextTemplateId);
    if (!nextTemplate) return;
    const nextLayers = cloneTemplateLayers(nextTemplate);
    setTemplateId(nextTemplate.id);
    setLayers(nextLayers);
    setSelectedLayerId(nextLayers[0]?.id ?? "");
    setActivePreviewLayerId("");
    setSelectedBackground(backgroundSelectionForTemplate(nextTemplate));
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

  const createCurrentTemplateSnapshot = () =>
    createCustomTemplateFromCover({
      channelId,
      layers,
      selectedBackground,
      templateNumber: customTemplates.length + 1,
    });

  const openSaveTemplateDialog = () => {
    setSaveTemplateMessage("");
    setSaveTemplateDialogOpen(true);
  };

  const saveCurrentAsTemplate = () => {
    const template = createCurrentTemplateSnapshot();
    const duplicateTemplate = findDuplicateTemplate(template, customTemplates);
    if (duplicateTemplate) {
      setSaveTemplateMessage("这个模板已经在模板库里了，不会重复添加。");
      return;
    }

    if (typeof window !== "undefined") {
      saveCustomTemplate(window.localStorage, template);
    }
    setCustomTemplates((currentTemplates) => [...currentTemplates, template]);
    const nextLayers = cloneTemplateLayers(template);
    setTemplateId(template.id);
    setLayers(nextLayers);
    setSelectedLayerId(nextLayers[0]?.id ?? "");
    setActivePreviewLayerId("");
    setSelectedBackground(backgroundSelectionForTemplate(template));
    setSaveTemplateDialogOpen(false);
  };

  const copyTemplateConfig = async () => {
    const templateSnapshot = createCurrentTemplateSnapshot();
    const matchingActiveTemplate = findDuplicateTemplate(templateSnapshot, [activeTemplate]);
    await copyTextWithFallback(
      templateToConfigText(matchingActiveTemplate ?? templateSnapshot),
    );
    setTemplateActionMessage("模板代码复制成功");
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

  const deleteLayer = useCallback((layerId: string) => {
    setLayers((currentLayers) => {
      const nextLayers = currentLayers.filter((layer) => layer.id !== layerId);
      setSelectedLayerId(nextLayers[0]?.id ?? "");
      setActivePreviewLayerId("");
      return nextLayers;
    });
    setEditingLayerId(null);
  }, []);

  const copySelectedTextLayer = useCallback(() => {
    const currentSelectedLayer = layersRef.current.find(
      (layer) => layer.id === selectedLayerIdRef.current,
    );
    if (currentSelectedLayer?.type !== "text") return false;
    copiedTextLayerRef.current = { ...currentSelectedLayer };
    return true;
  }, []);

  const pasteCopiedTextLayer = useCallback(() => {
    const copiedLayer = copiedTextLayerRef.current;
    if (!copiedLayer) return false;

    pastedLayerCounterRef.current += 1;
    const pastedLayer: CoverTextLayer = {
      ...copiedLayer,
      id: `text-copy-${Date.now().toString(36)}-${pastedLayerCounterRef.current}`,
      y: clamp(copiedLayer.y + PASTED_TEXT_LAYER_OFFSET_Y, 0, 92),
    };

    setLayers((currentLayers) => [...currentLayers, pastedLayer]);
    setSelectedLayerId(pastedLayer.id);
    setActivePreviewLayerId(pastedLayer.id);
    setEditingLayerId(null);
    return true;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || editingLayerIdRef.current) return;
      if (isEditableKeyboardTarget(event.target)) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        const currentSelectedLayer = layersRef.current.find(
          (layer) => layer.id === selectedLayerIdRef.current,
        );
        if (currentSelectedLayer?.type !== "text") return;
        event.preventDefault();
        deleteLayer(currentSelectedLayer.id);
        return;
      }

      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;

      const key = event.key.toLowerCase();
      if (key === "c" && copySelectedTextLayer()) {
        event.preventDefault();
        return;
      }

      if (key === "v" && pasteCopiedTextLayer()) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    copySelectedTextLayer,
    deleteLayer,
    pasteCopiedTextLayer,
  ]);

  useEffect(() => {
    if (!templateActionMessage) return;
    const timeoutId = window.setTimeout(() => {
      setTemplateActionMessage("");
    }, TEMPLATE_ACTION_MESSAGE_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [templateActionMessage]);

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>, layer: CoverLayer) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const layerRect = event.currentTarget.getBoundingClientRect();
    const modelSize = layer.type === "icon" ? layer.size : layer.width;
    const layerWidth =
      canvasRect?.width && layerRect.width
        ? (layerRect.width / canvasRect.width) * 100
        : modelSize;
    const layerHeight =
      canvasRect?.height && layerRect.height
        ? (layerRect.height / canvasRect.height) * 100
        : layer.type === "icon"
          ? layer.size
          : 0;
    setSelectedLayerId(layer.id);
    setActivePreviewLayerId(layer.id);
    setEditingLayerId(null);
    setCenterGuides({ vertical: false, horizontal: false });
    setDragState({
      layerId: layer.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layer.x,
      startY: layer.y,
      layerWidth,
      layerHeight,
    });
  };

  const moveDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragState || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = ((event.clientX - dragState.startClientX) / rect.width) * 100;
      const deltaY = ((event.clientY - dragState.startClientY) / rect.height) * 100;
      const snappedLayer = snapLayerToCanvasCenter({
        startX: dragState.startX,
        startY: dragState.startY,
        deltaX,
        deltaY,
        layerWidth: dragState.layerWidth,
        layerHeight: dragState.layerHeight,
      });
      setCenterGuides(snappedLayer.guides);
      setLayers((currentLayers) =>
        updateLayer(currentLayers, dragState.layerId, {
          x: snappedLayer.x,
          y: snappedLayer.y,
        }),
      );
    },
    [dragState],
  );

  const endDrag = () => {
    setDragState(null);
    setCenterGuides({ vertical: false, horizontal: false });
  };

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
      className="flex min-h-screen flex-col bg-[#fff8e0] text-[#1f1f1f] xl:h-screen xl:overflow-hidden"
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
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(344px,400px)_minmax(460px,1fr)_minmax(280px,312px)] border-t border-[#e6d5a8]/70 max-xl:grid-cols-1">
        <CoverToolPanel
          activeToolId={activeToolId}
          onActiveToolChange={setActiveToolId}
          templates={templates}
          customTemplates={customTemplates.filter((template) => template.channel === channelId)}
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
          centerGuides={centerGuides}
          onWheel={handlePreviewWheel}
          onPointerMove={moveDrag}
          onPointerEnd={endDrag}
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
          onOpenSaveTemplateDialog={openSaveTemplateDialog}
          onCopyTemplateConfig={copyTemplateConfig}
          templateActionMessage={templateActionMessage}
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
      {saveTemplateDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="保存为模板"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1f1f]/45 px-4"
        >
          <div className="w-full max-w-md rounded-xl border border-[#e6d5a8] bg-white p-6 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)]">
            <h2 className="text-lg font-semibold text-[#1f1f1f]">保存为模板</h2>
            <div className="mt-3 space-y-2 text-sm font-medium leading-6 text-[#4a4a4a]">
              <p>这个功能会把当前封面的文字、图标、背景和特效保存到浏览器里。</p>
              <p>保存后会出现在“我的模板”，下次打开这个浏览器也能继续复用。</p>
              <p>如果当前模板已经保存过，系统会提示并避免重复添加。</p>
            </div>
            {saveTemplateMessage && (
              <p role="alert" className="mt-4 rounded-md border border-[#e6d5a8] bg-[#fff8e0] px-3 py-2 text-sm font-semibold text-[#cc3a05]">
                {saveTemplateMessage}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSaveTemplateDialogOpen(false)}
                className="rounded-md border border-[#c7c7c7] bg-white px-4 py-2 text-sm font-semibold text-[#3d3d3d] transition hover:border-[#8a8a8a] hover:bg-[#fffaeb] hover:text-[#1f1f1f]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveCurrentAsTemplate}
                className="rounded-md bg-[#fa520f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#cc3a05]"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
