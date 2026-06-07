import type { BrandIconId, CoverIconLayer, CoverLayer, CoverTextLayer } from "./types";

let nextLayerId = 1;

function layerId(prefix: string) {
  nextLayerId += 1;
  return `${prefix}-${Date.now().toString(36)}-${nextLayerId}`;
}

export function createTextLayer(text = "双击改标题"): CoverTextLayer {
  return {
    id: layerId("text"),
    type: "text",
    text,
    x: 18,
    y: 36,
    width: 64,
    fontSize: 72,
    color: "#111111",
    fontFamily: "system",
    bold: true,
    italic: false,
    underline: false,
    align: "center",
    lineHeight: 1.08,
    letterSpacing: 0,
    textEffect: "none",
    highlightEffect: "none",
  };
}

export function createIconLayer(iconId: BrandIconId): CoverIconLayer {
  return {
    id: layerId("icon"),
    type: "icon",
    iconId,
    x: 72,
    y: 12,
    size: 13,
  };
}

export function updateLayer<T extends CoverLayer>(
  layers: CoverLayer[],
  layerIdToUpdate: string,
  patch: Partial<T>,
) {
  return layers.map((layer) =>
    layer.id === layerIdToUpdate ? ({ ...layer, ...patch } as CoverLayer) : layer,
  );
}
