import { describe, expect, it } from "vitest";
import { calculateGridTiles, calculateTiles } from "./split";

describe("calculateTiles", () => {
  it("splits a selected region in row-major order", () => {
    expect(calculateTiles(1200, 800, { x: 0.1, y: 0.25, width: 0.6, height: 0.5 }, 3, 2)).toEqual([
      { column: 0, row: 0, x: 120, y: 200, width: 240, height: 200 },
      { column: 1, row: 0, x: 360, y: 200, width: 240, height: 200 },
      { column: 2, row: 0, x: 600, y: 200, width: 240, height: 200 },
      { column: 0, row: 1, x: 120, y: 400, width: 240, height: 200 },
      { column: 1, row: 1, x: 360, y: 400, width: 240, height: 200 },
      { column: 2, row: 1, x: 600, y: 400, width: 240, height: 200 },
    ]);
  });

  it("uses shared rounded boundaries so no pixels are lost", () => {
    const tiles = calculateTiles(100, 101, { x: 0, y: 0, width: 1, height: 1 }, 3, 2);

    expect(tiles.filter((tile) => tile.row === 0).reduce((sum, tile) => sum + tile.width, 0)).toBe(100);
    expect(tiles[0].height + tiles[3].height).toBe(101);
    expect(tiles[1].x).toBe(33);
    expect(tiles[2].x + tiles[2].width).toBe(100);
  });

  it("supports movable grid lines and independent trims for every tile", () => {
    const tiles = calculateGridTiles(
      1000,
      800,
      { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
      [0.4],
      [0.6],
      {
        0: { top: 10, right: 20, bottom: 30, left: 40 },
        3: { top: 5, right: 6, bottom: 7, left: 8 },
      },
    );

    expect(tiles[0]).toEqual({ column: 0, row: 0, x: 140, y: 90, width: 260, height: 344 });
    expect(tiles[1]).toEqual({ column: 1, row: 0, x: 420, y: 80, width: 480, height: 384 });
    expect(tiles[3]).toEqual({ column: 1, row: 1, x: 428, y: 469, width: 466, height: 244 });
  });

  it("clamps excessive trims so an exported tile always remains valid", () => {
    const [tile] = calculateGridTiles(
      100,
      100,
      { x: 0, y: 0, width: 1, height: 1 },
      [],
      [],
      { 0: { top: 1000, right: 1000, bottom: 1000, left: 1000 } },
    );

    expect(tile).toEqual({ column: 0, row: 0, x: 99, y: 99, width: 1, height: 1 });
  });
});
