export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PixelTile = {
  column: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TrimInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type TrimsByTile = Record<number, TrimInsets>;

export const FULL_CROP: CropArea = { x: 0, y: 0, width: 1, height: 1 };
export const MIN_CROP_SIZE = 0.04;
export const ZERO_TRIM: TrimInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function calculateTiles(
  imageWidth: number,
  imageHeight: number,
  crop: CropArea,
  columns: number,
  rows: number,
) {
  return calculateGridTiles(
    imageWidth,
    imageHeight,
    crop,
    Array.from({ length: columns - 1 }, (_, index) => (index + 1) / columns),
    Array.from({ length: rows - 1 }, (_, index) => (index + 1) / rows),
    {},
  );
}

export function calculateGridTiles(
  imageWidth: number,
  imageHeight: number,
  crop: CropArea,
  columnCuts: number[],
  rowCuts: number[],
  trims: TrimsByTile,
) {
  const cropLeft = Math.round(crop.x * imageWidth);
  const cropTop = Math.round(crop.y * imageHeight);
  const cropRight = Math.round((crop.x + crop.width) * imageWidth);
  const cropBottom = Math.round((crop.y + crop.height) * imageHeight);
  const columnBounds = [0, ...columnCuts, 1];
  const rowBounds = [0, ...rowCuts, 1];
  const columns = columnBounds.length - 1;
  const rows = rowBounds.length - 1;
  const tiles: PixelTile[] = [];

  for (let row = 0; row < rows; row += 1) {
    const baseTop = Math.round(cropTop + (cropBottom - cropTop) * rowBounds[row]);
    const baseBottom = Math.round(cropTop + (cropBottom - cropTop) * rowBounds[row + 1]);

    for (let column = 0; column < columns; column += 1) {
      const baseLeft = Math.round(cropLeft + (cropRight - cropLeft) * columnBounds[column]);
      const baseRight = Math.round(cropLeft + (cropRight - cropLeft) * columnBounds[column + 1]);
      const trim = trims[row * columns + column] ?? ZERO_TRIM;
      const leftTrim = clamp(Math.round(trim.left), 0, Math.max(0, baseRight - baseLeft - 1));
      const rightTrim = clamp(Math.round(trim.right), 0, Math.max(0, baseRight - baseLeft - leftTrim - 1));
      const topTrim = clamp(Math.round(trim.top), 0, Math.max(0, baseBottom - baseTop - 1));
      const bottomTrim = clamp(Math.round(trim.bottom), 0, Math.max(0, baseBottom - baseTop - topTrim - 1));
      tiles.push({
        column,
        row,
        x: baseLeft + leftTrim,
        y: baseTop + topTrim,
        width: baseRight - baseLeft - leftTrim - rightTrim,
        height: baseBottom - baseTop - topTrim - bottomTrim,
      });
    }
  }

  return tiles;
}
