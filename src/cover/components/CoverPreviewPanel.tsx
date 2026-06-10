import { Code2, Save } from "lucide-react";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from "react";
import type { CoverLayer } from "@/cover/lib/cover";
import type { CenterGuideState, CoverBackgroundSelection } from "./coverEditorTypes";
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
  centerGuides: CenterGuideState;
  onWheel: (event: ReactWheelEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
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
  boardStrip?: ReactNode;
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
  centerGuides,
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
  boardStrip,
}: CoverPreviewPanelProps) {
  return (
    <section
      aria-label="封面预览面板"
      onWheel={onWheel}
      className="relative flex min-w-0 flex-col gap-3 bg-[#fff8e0] p-6 max-sm:p-3"
    >
      <div
        data-cover-preview-toolbar="true"
        className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-lg border border-[#e6d5a8] bg-white/95 p-1 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur"
      >
        <button
          type="button"
          aria-label="保存为模板"
          title="保存为模板"
          onClick={onOpenSaveTemplateDialog}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1f1f1f] px-3 text-sm font-semibold text-white transition hover:bg-[#3d3d3d]"
        >
          <Save size={16} aria-hidden="true" />
          保存为模板
        </button>
        <button
          type="button"
          aria-label="复制模板配置"
          title="复制当前模板配置"
          onClick={onCopyTemplateConfig}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#6a6a6a] transition hover:bg-[#fffaeb] hover:text-[#1f1f1f]"
        >
          <Code2 size={17} aria-hidden="true" />
        </button>
      </div>
      {templateActionMessage && (
        <div
          role="status"
          className="absolute right-5 top-20 z-20 rounded-md bg-[#1f1f1f] px-3 py-2 text-xs font-semibold text-white shadow-lg"
        >
          {templateActionMessage}
        </div>
      )}
      <div className="flex min-h-[calc(100vh-190px)] flex-1 items-center justify-center overflow-auto rounded-xl border border-[#e6d5a8]/70 bg-[linear-gradient(rgba(230,213,168,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(230,213,168,0.28)_1px,transparent_1px)] bg-[size:24px_24px] p-3 max-xl:min-h-[720px]">
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
              "absolute left-0 top-0 overflow-hidden shadow-[0_18px_42px_rgba(31,31,31,0.16)] ring-1 ring-[#1f1f1f]/10",
              selectedBackgroundClassName,
            ].join(" ")}
            style={{ ...canvasStyle, ...selectedBackgroundStyle }}
          >
            {centerGuides.vertical && (
              <div
                aria-label="垂直居中参考线"
                className="pointer-events-none absolute left-1/2 top-0 z-20 h-full w-px -translate-x-1/2 bg-[#fa520f] shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_0_18px_rgba(250,82,15,0.55)]"
              />
            )}
            {centerGuides.horizontal && (
              <div
                aria-label="水平居中参考线"
                className="pointer-events-none absolute left-0 top-1/2 z-20 h-px w-full -translate-y-1/2 bg-[#fa520f] shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_0_18px_rgba(250,82,15,0.55)]"
              />
            )}
            <CoverCanvasContent
              layers={layers}
              selectedLayerId={selectedLayerId}
              editingLayerId={editingLayerId ?? undefined}
              showBackgroundDecorations={selectedBackground.kind === "color"}
              onSelectLayer={onSelectLayer}
              onDragStart={onBeginDrag}
              onDragMove={onPointerMove}
              onEditTextLayer={onEditTextLayer}
              onTextLayerChange={onTextLayerChange}
              onFinishEditing={onFinishEditing}
              onDeleteLayer={onDeleteLayer}
            />
          </div>
        </div>
      </div>
      {boardStrip}
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
