import { calculateGridTiles, CropArea, TrimsByTile } from "./split";
import { createZipBlob } from "./zip";

export type OutputFormat = "png" | "jpeg" | "webp";

const MIME_TYPES: Record<OutputFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const EXTENSIONS: Record<OutputFormat, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
};

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("图片生成失败，请更换输出格式后重试"));
    }, type, quality);
  });
}

function blobToArrayBuffer(blob: Blob) {
  if (typeof blob.arrayBuffer === "function") return blob.arrayBuffer();

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer
        ? resolve(reader.result)
        : reject(new Error("图片读取失败"));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsArrayBuffer(blob);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function outputExtension(format: OutputFormat) {
  return EXTENSIONS[format];
}

export async function exportSlices(
  image: HTMLImageElement,
  crop: CropArea,
  columnCuts: number[],
  rowCuts: number[],
  trims: TrimsByTile,
  format: OutputFormat,
) {
  const tiles = calculateGridTiles(
    image.naturalWidth,
    image.naturalHeight,
    crop,
    columnCuts,
    rowCuts,
    trims,
  );
  const columns = columnCuts.length + 1;
  const rows = rowCuts.length + 1;
  const files = [];

  for (let index = 0; index < tiles.length; index += 1) {
    const tile = tiles[index];
    const canvas = document.createElement("canvas");
    canvas.width = tile.width;
    canvas.height = tile.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("浏览器不支持图片切割");

    context.drawImage(
      image,
      tile.x,
      tile.y,
      tile.width,
      tile.height,
      0,
      0,
      tile.width,
      tile.height,
    );
    const blob = await canvasToBlob(
      canvas,
      MIME_TYPES[format],
      format === "png" ? undefined : 0.92,
    );
    files.push({
      filename: `切图-${String(index + 1).padStart(2, "0")}.${EXTENSIONS[format]}`,
      data: await blobToArrayBuffer(blob),
    });
  }

  downloadBlob(createZipBlob(files), `自动切图-${columns}x${rows}.zip`);
}
