import { Code2, Save } from "lucide-react";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from "react";
import type { CoverLayer } from "@/cover/lib/cover";
import type { CoverBackgroundSelection } from "./coverEditorTypes";
import { CoverCanvasContent } from "./CoverCanvas";

type CoverPreviewPanelProps = {
  canvasRef: RefObject<HTMLDivElement>;
  channelWidth: number;
  channelHeight: number;
  canvasScale: number;
  canvasStyle: CSSProperties;
  selectedBackground: CoverBackgroundSelection;
  selectedBackgroundClassName: string;
  selectedBackgroundStyle: CSSProperties;
  layers: CoverLayer[];
  selectedLayerId: string;
  editingLayerId: string | null;
  onWheel: (event: ReactWheelEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerEnd: () => void;
  onSelectLayer: (layerId: string) => void;
  onBeginDrag: (event: ReactPointerEvent<HTMLButtonElement>, layer: CoverLayer) => void;
  onEditTextLayer: (layerId: string) => void;
  onTextLayerChange: (layerId: string, text: string) => void;
  onFinishEditing: () => void;
  onDeleteLayer: (layerId: string) => void;
  onOpenSaveTemplateDialog: () => void;
  onCopyTemplateConfig: () => void;
  templateActionMessage: string;
};

export function CoverPreviewPanel({
  canvasRef,
  channelWidth,
  channelHeight,
  canvasScale,
  canvasStyle,
  selectedBackground,
  selectedBackgroundClassName,
  selectedBackgroundStyle,
  layers,
  selectedLayerId,
  editingLayerId,
  onWheel,
  onPointerMove,
  onPointerEnd,
  onSelectLayer,
  onBeginDrag,
  onEditTextLayer,
  onTextLayerChange,
  onFinishEditing,
  onDeleteLayer,
  onOpenSaveTemplateDialog,
  onCopyTemplateConfig,
  templateActionMessage,
}: CoverPreviewPanelProps) {
  return (
    <section
      aria-label="封面预览面板"
      onWheel={onWheel}
      className="relative min-w-0 bg-[#f2f3f5] p-6 max-sm:p-3"
    >
      <button
        type="button"
        aria-label="保存为模板"
        title="保存为模板"
        onClick={onOpenSaveTemplateDialog}
        className="absolute right-14 top-4 z-20 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-bold text-zinc-900 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-50"
      >
        <Save size={16} aria-hidden="true" />
        保存为模板
      </button>
      <button
        type="button"
        aria-label="复制模板配置"
        title="复制当前模板配置"
        onClick={onCopyTemplateConfig}
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-zinc-500 shadow-sm ring-1 ring-zinc-200 transition hover:bg-white hover:text-zinc-900"
      >
        <Code2 size={17} aria-hidden="true" />
      </button>
      {templateActionMessage && (
        <div
          role="status"
          className="absolute right-4 top-16 z-20 rounded-md bg-zinc-950 px-3 py-2 text-xs font-bold text-white shadow-lg"
        >
          {templateActionMessage}
        </div>
      )}
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center overflow-auto p-3 max-xl:min-h-[720px]">
        <div
          className="relative"
          style={{
            width: `${channelWidth * canvasScale}px`,
            height: `${channelHeight * canvasScale}px`,
          }}
        >
          <div
            ref={canvasRef}
            aria-label="封面画布"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
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
              onSelectLayer={onSelectLayer}
              onDragStart={onBeginDrag}
              onEditTextLayer={onEditTextLayer}
              onTextLayerChange={onTextLayerChange}
              onFinishEditing={onFinishEditing}
              onDeleteLayer={onDeleteLayer}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CoverExportCanvas({
  exportCanvasRef,
  channelWidth,
  channelHeight,
  selectedBackground,
  selectedBackgroundClassName,
  selectedBackgroundStyle,
  layers,
}: {
  exportCanvasRef: RefObject<HTMLDivElement>;
  channelWidth: number;
  channelHeight: number;
  selectedBackground: CoverBackgroundSelection;
  selectedBackgroundClassName: string;
  selectedBackgroundStyle: CSSProperties;
  layers: CoverLayer[];
}) {
  return (
    <div className="export-pages pointer-events-none fixed -left-[10000px] top-0" aria-hidden="true">
      <div
        ref={exportCanvasRef}
        className={["cover-export-node relative overflow-hidden", selectedBackgroundClassName].join(" ")}
        style={{
          width: `${channelWidth}px`,
          height: `${channelHeight}px`,
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
  );
}
