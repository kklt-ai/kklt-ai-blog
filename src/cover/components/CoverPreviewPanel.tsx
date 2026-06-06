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
}: CoverPreviewPanelProps) {
  return (
    <section
      aria-label="封面预览面板"
      onWheel={onWheel}
      className="min-w-0 bg-[#f2f3f5] p-6 max-sm:p-3"
    >
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
