import type { CoverBackgroundFit, CoverLayer } from "@/cover/lib/cover";

export type DragState = {
  layerId: string;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  layerWidth: number;
  layerHeight: number;
};

export type ResizeHandleCorner =
  | "top-left"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-right";

export type ResizeState = {
  layerId: string;
  layerType: CoverLayer["type"];
  corner: ResizeHandleCorner;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startFontSize?: number;
};

export type CenterGuideState = {
  vertical: boolean;
  horizontal: boolean;
};

export type CoverToolId = "templates" | "text" | "image" | "background";
export type CoverBackgroundTabId = "image" | "color";
export type CoverBackgroundSelection =
  | { kind: "image"; id: string; src: string; fit?: CoverBackgroundFit }
  | { kind: "color"; id: string; className: string };

export type PatchSelectedLayer = <T extends CoverLayer>(patch: Partial<T>) => void;
