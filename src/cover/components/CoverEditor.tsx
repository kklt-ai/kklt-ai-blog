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
  updateLayer,
} from "@/cover/lib/cover";
import { templateToConfigText } from "@/cover/lib/customTemplates";
import { downloadCoverNodeAsPng } from "@/cover/lib/export";
import { snapLayerToCanvasCenter } from "@/cover/lib/snapping";
import { CoverSettingsPanel } from "./CoverSettingsPanel";
import { CoverToolPanel } from "./CoverToolPanel";
import { CoverTopNav } from "./CoverTopNav";
import { CoverExportCanvas, CoverPreviewPanel } from "./CoverPreviewPanel";
import { CoverBoardStrip } from "./CoverBoardStrip";
import { SaveTemplateDialog } from "./SaveTemplateDialog";
import { TemplateApplyDialog } from "./TemplateApplyDialog";
import { useCoverBoards } from "./useCoverBoards";
import { useCoverAssetLibrary } from "./useCoverAssetLibrary";
import {
  MAX_COVER_BOARDS,
  type CoverBoard,
  cloneCoverBackground,
  cloneCoverLayers,
  createCoverBoard,
} from "./coverBoards";
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

function backgroundSelectionForTemplate(
  template: CoverTemplate,
  backgroundImages = getBackgroundImagesByChannel(template.channel),
): CoverBackgroundSelection {
  if (template.backgroundImageId) {
    const image = backgroundImages.find(
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
  const initialBoardStateRef = useRef<{
    boards: CoverBoard[];
    activeBoardId: string;
  } | null>(null);
  const initialBoard =
    initialBoardStateRef.current?.boards.find(
      (board) => board.id === initialBoardStateRef.current?.activeBoardId,
    ) ?? initialBoardStateRef.current?.boards[0];
  const [channelId, setChannelId] = useState<CoverChannelId>(
    initialBoard?.channelId ?? "xiaohongshu",
  );
  const {
    templates,
    customTemplates,
    customTemplatesForChannel,
    templateFavoriteTimes,
    backgroundImages,
    customBackgroundImagesForChannel,
    backgroundFavoriteTimes,
    createCurrentTemplateSnapshot: createTemplateSnapshot,
    findDuplicateTemplate,
    getTemplatesForChannel,
    getBackgroundsForChannel,
    saveTemplate,
    removeTemplate,
    toggleTemplateFavorite,
    toggleBackgroundFavorite,
    removeBackground,
    saveUploadedBackground,
  } = useCoverAssetLibrary(channelId);
  const [templateId, setTemplateId] = useState(initialBoard?.templateId ?? templates[0].id);
  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? templates[0],
    [templateId, templates],
  );
  const defaultBoardRef = useRef<CoverBoard | null>(null);
  if (defaultBoardRef.current === null) {
    defaultBoardRef.current = createCoverBoard({
      id: "cover-board-default",
      channelId,
      templateId: activeTemplate.id,
      selectedBackground: backgroundSelectionForTemplate(activeTemplate, backgroundImages),
      layers: cloneTemplateLayers(activeTemplate),
    });
  }
  const initialActiveBoard = initialBoard ?? defaultBoardRef.current;
  const [layers, setLayers] = useState<CoverLayer[]>(() =>
    cloneCoverLayers(initialActiveBoard.layers),
  );
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
  const [toolPanelExpanded, setToolPanelExpanded] = useState(false);
  const [activeEffectCategoryId, setActiveEffectCategoryId] =
    useState<TextEffectCategoryId>("outline");
  const [backgroundTabId, setBackgroundTabId] = useState<CoverBackgroundTabId>("image");
  const [logoSearchQuery, setLogoSearchQuery] = useState("");
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [saveTemplateMessage, setSaveTemplateMessage] = useState("");
  const [templateActionMessage, setTemplateActionMessage] = useState("");
  const [selectedBackground, setSelectedBackground] = useState<CoverBackgroundSelection>(() =>
    cloneCoverBackground(initialActiveBoard.selectedBackground),
  );
  const [canvasScale, setCanvasScale] = useState(() => defaultCanvasScale(channelId));

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

  const {
    boards,
    activeBoardId,
    boardActionMessage,
    pendingTemplate,
    chooseTemplate,
    cancelPendingTemplate,
    selectBoard,
    addBoardFromCurrent,
    deleteBoard,
    createBoardFromPendingTemplate,
    overwriteCurrentBoardWithPendingTemplate,
    resetToTemplate,
  } = useCoverBoards({
    initialBoardState: initialBoardStateRef.current,
    defaultBoard: defaultBoardRef.current,
    channelId,
    templateId,
    layers,
    selectedBackground,
    templates,
    getTemplatesForChannel,
    getBackgroundsForChannel,
    setChannelId,
    setTemplateId,
    setLayers,
    setSelectedLayerId,
    setActivePreviewLayerId,
    setEditingLayerId,
    setSelectedBackground,
    setCanvasScale,
    defaultCanvasScale,
    backgroundSelectionForTemplate,
  });

  const chooseChannel = (nextChannelId: CoverChannelId) => {
    const nextTemplate = getTemplatesForChannel(nextChannelId)[0];
    setChannelId(nextChannelId);
    resetToTemplate(nextChannelId, nextTemplate.id);
    setCanvasScale(defaultCanvasScale(nextChannelId));
  };

  const toggleToolPanel = (toolId: CoverToolId) => {
    setActiveToolId(toolId);
    setToolPanelExpanded((expanded) => (toolId === activeToolId ? !expanded : true));
  };

  const createCurrentTemplateSnapshot = () =>
    createTemplateSnapshot({
      channelId,
      layers,
      selectedBackground,
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

    saveTemplate(template);
    const nextLayers = cloneTemplateLayers(template);
    setTemplateId(template.id);
    setLayers(nextLayers);
    setSelectedLayerId(nextLayers[0]?.id ?? "");
    setActivePreviewLayerId("");
    setSelectedBackground(backgroundSelectionForTemplate(template, backgroundImages));
    setActiveToolId("templates");
    setToolPanelExpanded(true);
    setSaveTemplateDialogOpen(false);
  };

  const deleteSavedTemplate = (nextTemplateId: string) => {
    const { nextCustomTemplates, nextFavoriteTimes } = removeTemplate(nextTemplateId);
    if (templateId !== nextTemplateId) return;
    const nextTemplates = getTemplatesForChannel(channelId, nextCustomTemplates, nextFavoriteTimes);
    if (nextTemplates[0]) resetToTemplate(channelId, nextTemplates[0].id);
  };

  const deleteSavedBackground = (backgroundId: string) => {
    const { nextCustomBackgroundImages, nextFavoriteTimes } = removeBackground(backgroundId);
    if (selectedBackground.kind !== "image" || selectedBackground.id !== backgroundId) return;
    const nextBackground = getBackgroundsForChannel(
      channelId,
      nextCustomBackgroundImages,
      nextFavoriteTimes,
    )[0];
    if (nextBackground) {
      setSelectedBackground({ kind: "image", id: nextBackground.id, src: nextBackground.src });
    }
  };

  const uploadBackground = (file: File) => {
    saveUploadedBackground(file, (background) => {
      setSelectedBackground({ kind: "image", id: background.id, src: background.src });
      setBackgroundTabId("image");
    });
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
  const workspaceGridClassName = [
    "grid min-h-0 flex-1 max-xl:grid-cols-1",
    toolPanelExpanded
      ? "grid-cols-[minmax(344px,400px)_minmax(460px,1fr)_minmax(260px,288px)]"
      : "grid-cols-[76px_minmax(460px,1fr)_minmax(260px,288px)]",
  ].join(" ");

  return (
    <main
      className="flex min-h-screen flex-col bg-[#fcfaf8] text-[#26251e] xl:h-screen xl:overflow-hidden"
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
      <div className={workspaceGridClassName}>
        <CoverToolPanel
          activeToolId={activeToolId}
          expanded={toolPanelExpanded}
          onActiveToolChange={toggleToolPanel}
          templates={templates}
          customTemplates={customTemplatesForChannel}
          templateFavoriteTimes={templateFavoriteTimes}
          activeTemplate={activeTemplate}
          onChooseTemplate={chooseTemplate}
          onToggleTemplateFavorite={toggleTemplateFavorite}
          onDeleteCustomTemplate={deleteSavedTemplate}
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
          customBackgroundImages={customBackgroundImagesForChannel}
          backgroundFavoriteTimes={backgroundFavoriteTimes}
          selectedBackground={selectedBackground}
          onSelectedBackgroundChange={setSelectedBackground}
          onToggleBackgroundFavorite={toggleBackgroundFavorite}
          onDeleteCustomBackground={deleteSavedBackground}
          onUploadBackground={uploadBackground}
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
          boardStrip={
            <CoverBoardStrip
              boards={boards}
              activeBoardId={activeBoardId}
              message={boardActionMessage}
              onSelectBoard={selectBoard}
              onAddBoard={addBoardFromCurrent}
              onDeleteBoard={deleteBoard}
            />
          }
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
        <SaveTemplateDialog
          message={saveTemplateMessage}
          onCancel={() => setSaveTemplateDialogOpen(false)}
          onConfirm={saveCurrentAsTemplate}
        />
      )}
      {pendingTemplate && (
        <TemplateApplyDialog
          templateName={pendingTemplate.name}
          canCreateBoard={boards.length < MAX_COVER_BOARDS}
          onCreateBoard={createBoardFromPendingTemplate}
          onOverwriteBoard={overwriteCurrentBoardWithPendingTemplate}
          onCancel={cancelPendingTemplate}
        />
      )}
    </main>
  );
}
