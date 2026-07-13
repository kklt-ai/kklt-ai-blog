"use client";

import {
  Download,
  Grid3X3,
  ImagePlus,
  LoaderCircle,
  Minimize2,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { ChangeEvent, DragEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { exportSlices, OutputFormat } from "./lib/export";
import {
  calculateGridTiles,
  clamp,
  CropArea,
  FULL_CROP,
  MIN_CROP_SIZE,
  TrimInsets,
  TrimsByTile,
  ZERO_TRIM,
} from "./lib/split";

type CropDragMode = "draw" | "move" | "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";
type TrimDragMode = "trim-top" | "trim-right" | "trim-bottom" | "trim-left";
type DragMode = CropDragMode | TrimDragMode;

type DragState = {
  mode: DragMode;
  startX: number;
  startY: number;
  crop: CropArea;
};

const formatOptions: { value: OutputFormat; label: string; note: string }[] = [
  { value: "png", label: "PNG", note: "无损画质" },
  { value: "jpeg", label: "JPG", note: "文件更小" },
  { value: "webp", label: "WebP", note: "体积最优" },
];

const handles: { mode: CropDragMode; className: string; cursor: string }[] = [
  { mode: "nw", className: "-left-1.5 -top-1.5", cursor: "nwse-resize" },
  { mode: "n", className: "left-1/2 -top-1.5 -translate-x-1/2", cursor: "ns-resize" },
  { mode: "ne", className: "-right-1.5 -top-1.5", cursor: "nesw-resize" },
  { mode: "e", className: "-right-1.5 top-1/2 -translate-y-1/2", cursor: "ew-resize" },
  { mode: "se", className: "-bottom-1.5 -right-1.5", cursor: "nwse-resize" },
  { mode: "s", className: "-bottom-1.5 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
  { mode: "sw", className: "-bottom-1.5 -left-1.5", cursor: "nesw-resize" },
  { mode: "w", className: "-left-1.5 top-1/2 -translate-y-1/2", cursor: "ew-resize" },
];

function resizeCrop(start: CropArea, mode: CropDragMode, dx: number, dy: number) {
  let left = start.x;
  let top = start.y;
  let right = start.x + start.width;
  let bottom = start.y + start.height;

  if (mode.includes("w")) left = clamp(start.x + dx, 0, right - MIN_CROP_SIZE);
  if (mode.includes("e")) right = clamp(right + dx, left + MIN_CROP_SIZE, 1);
  if (mode.includes("n")) top = clamp(start.y + dy, 0, bottom - MIN_CROP_SIZE);
  if (mode.includes("s")) bottom = clamp(bottom + dy, top + MIN_CROP_SIZE, 1);

  return { x: left, y: top, width: right - left, height: bottom - top };
}

function percent(value: number) {
  return `${value * 100}%`;
}

function evenCuts(count: number) {
  return Array.from({ length: count - 1 }, (_, index) => (index + 1) / count);
}

function cellBounds(cuts: number[], index: number) {
  return {
    start: index === 0 ? 0 : cuts[index - 1],
    end: index === cuts.length ? 1 : cuts[index],
  };
}

const trimSides: { key: keyof TrimInsets; label: string }[] = [
  { key: "top", label: "上" },
  { key: "right", label: "右" },
  { key: "bottom", label: "下" },
  { key: "left", label: "左" },
];

export function ImageSplitterApp() {
  const [source, setSource] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [crop, setCrop] = useState<CropArea>(FULL_CROP);
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [columnCuts, setColumnCuts] = useState(() => evenCuts(3));
  const [rowCuts, setRowCuts] = useState(() => evenCuts(3));
  const [trims, setTrims] = useState<TrimsByTile>({});
  const [selectedTile, setSelectedTile] = useState(0);
  const [format, setFormat] = useState<OutputFormat>("png");
  const [drag, setDrag] = useState<DragState | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => {
    if (source) URL.revokeObjectURL(source);
  }, [source]);

  const tiles = useMemo(
    () => imageSize.width
      ? calculateGridTiles(imageSize.width, imageSize.height, crop, columnCuts, rowCuts, trims)
      : [],
    [columnCuts, crop, imageSize, rowCuts, trims],
  );
  const selectedTileData = tiles[selectedTile] ?? tiles[0];
  const selectedTrim = trims[selectedTile] ?? ZERO_TRIM;

  function setGrid(nextColumns: number, nextRows: number) {
    const safeColumns = Math.round(clamp(nextColumns, 1, 10));
    const safeRows = Math.round(clamp(nextRows, 1, 10));
    setColumns(safeColumns);
    setRows(safeRows);
    setColumnCuts(evenCuts(safeColumns));
    setRowCuts(evenCuts(safeRows));
    setTrims({});
    setSelectedTile(0);
  }

  function loadFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("请选择 PNG、JPG、WebP 等图片文件");
      return;
    }
    if (source) URL.revokeObjectURL(source);
    setSource(URL.createObjectURL(file));
    setFilename(file.name);
    setCrop(FULL_CROP);
    setColumnCuts(evenCuts(columns));
    setRowCuts(evenCuts(rows));
    setTrims({});
    setSelectedTile(0);
    setImageSize({ width: 0, height: 0 });
    setError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    loadFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setIsDraggingFile(false);
    loadFile(event.dataTransfer.files?.[0]);
  }

  function pointerPosition(event: PointerEvent) {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((event.clientY - rect.top) / rect.height),
    };
  }

  function startDrag(event: PointerEvent, mode: DragMode) {
    event.preventDefault();
    event.stopPropagation();
    const point = pointerPosition(event);
    stageRef.current?.setPointerCapture(event.pointerId);
    setDrag({ mode, startX: point.x, startY: point.y, crop });
    if (mode === "draw") setCrop({ x: point.x, y: point.y, width: 0, height: 0 });
  }

  function startTrimDrag(event: PointerEvent, mode: TrimDragMode) {
    event.preventDefault();
    event.stopPropagation();
    const point = pointerPosition(event);
    stageRef.current?.setPointerCapture(event.pointerId);
    setDrag({ mode, startX: point.x, startY: point.y, crop });
  }

  function movePointer(event: PointerEvent) {
    if (!drag) return;
    const point = pointerPosition(event);
    const dx = point.x - drag.startX;
    const dy = point.y - drag.startY;

    if (
      drag.mode === "trim-top" ||
      drag.mode === "trim-right" ||
      drag.mode === "trim-bottom" ||
      drag.mode === "trim-left"
    ) {
      const row = Math.floor(selectedTile / columns);
      const column = selectedTile % columns;
      const horizontal = cellBounds(columnCuts, column);
      const vertical = cellBounds(rowCuts, row);
      const baseLeft = crop.x + crop.width * horizontal.start;
      const baseRight = crop.x + crop.width * horizontal.end;
      const baseTop = crop.y + crop.height * vertical.start;
      const baseBottom = crop.y + crop.height * vertical.end;

      if (drag.mode === "trim-left") updateTrim("left", (point.x - baseLeft) * imageSize.width);
      if (drag.mode === "trim-right") updateTrim("right", (baseRight - point.x) * imageSize.width);
      if (drag.mode === "trim-top") updateTrim("top", (point.y - baseTop) * imageSize.height);
      if (drag.mode === "trim-bottom") updateTrim("bottom", (baseBottom - point.y) * imageSize.height);
      return;
    }

    if (drag.mode === "move") {
      setCrop({
        ...drag.crop,
        x: clamp(drag.crop.x + dx, 0, 1 - drag.crop.width),
        y: clamp(drag.crop.y + dy, 0, 1 - drag.crop.height),
      });
      return;
    }
    if (drag.mode === "draw") {
      setCrop({
        x: Math.min(drag.startX, point.x),
        y: Math.min(drag.startY, point.y),
        width: Math.abs(point.x - drag.startX),
        height: Math.abs(point.y - drag.startY),
      });
      return;
    }
    setCrop(resizeCrop(drag.crop, drag.mode, dx, dy));
  }

  function finishDrag(event: PointerEvent) {
    if (!drag) return;
    stageRef.current?.releasePointerCapture(event.pointerId);
    if (drag.mode === "draw" && (crop.width < MIN_CROP_SIZE || crop.height < MIN_CROP_SIZE)) {
      setCrop(drag.crop);
    }
    setDrag(null);
  }

  function updateTrim(side: keyof TrimInsets, value: number) {
    setTrims((current) => ({
      ...current,
      [selectedTile]: { ...(current[selectedTile] ?? ZERO_TRIM), [side]: Math.max(0, Math.round(value)) },
    }));
  }

  function applyTrimToAll() {
    const next: TrimsByTile = {};
    for (let index = 0; index < columns * rows; index += 1) {
      next[index] = { ...selectedTrim };
    }
    setTrims(next);
  }

  async function handleExport() {
    const image = imageRef.current;
    if (!image) return;
    setIsExporting(true);
    setError("");
    try {
      await exportSlices(image, crop, columnCuts, rowCuts, trims, format);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#171713]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#171713] text-white">
              <Scissors size={20} />
            </div>
            <div>
              <h1 className="m-0 text-lg font-bold tracking-tight">自动切图</h1>
              <p className="m-0 text-xs text-black/50">图片网格裁切工具</p>
            </div>
          </div>
          <a className="text-sm font-medium text-black/55 no-underline transition hover:text-black" href="/">返回作品集</a>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-5 p-4 sm:p-6 lg:grid-cols-[310px_minmax(0,1fr)] lg:p-8">
        <aside className="order-2 space-y-4 lg:order-1">
          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="mb-5 flex items-center gap-2 text-sm font-bold"><Grid3X3 size={17} />切割设置</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-black/60">
                横向列数
                <input aria-label="横向列数" className="mt-2 h-11 w-full rounded-xl border border-black/15 bg-[#fafaf8] px-3 text-base font-bold outline-none focus:border-black" max={10} min={1} onChange={(event) => setGrid(clamp(Number(event.target.value), 1, 10), rows)} type="number" value={columns} />
              </label>
              <label className="text-xs font-medium text-black/60">
                纵向行数
                <input aria-label="纵向行数" className="mt-2 h-11 w-full rounded-xl border border-black/15 bg-[#fafaf8] px-3 text-base font-bold outline-none focus:border-black" max={10} min={1} onChange={(event) => setGrid(columns, clamp(Number(event.target.value), 1, 10))} type="number" value={rows} />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              {[[3, 1], [3, 2], [3, 3]].map(([presetColumns, presetRows]) => (
                <button className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${columns === presetColumns && rows === presetRows ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/30"}`} key={presetRows} onClick={() => setGrid(presetColumns, presetRows)} type="button">
                  {presetColumns * presetRows} 宫格
                </button>
              ))}
            </div>
          </section>

          {source && (
            <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold"><Minimize2 size={17} />单格边缘内收</div>
                  <p className="m-0 mt-1 text-[11px] leading-4 text-black/45">拖动当前格的橙色四边，或输入像素精确去边</p>
                </div>
                <span className="shrink-0 rounded-md bg-[#fff0eb] px-2 py-1 text-xs font-bold text-[#d6411e]">第 {selectedTile + 1} 格</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {trimSides.map((side) => (
                  <label className="flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-[#fafaf8] px-3 text-xs font-medium text-black/55" key={side.key}>
                    <span>{side.label}</span>
                    <input aria-label={`${side.label}边内收像素`} className="min-w-0 flex-1 bg-transparent text-right font-bold text-black outline-none" max={5000} min={0} onChange={(event) => updateTrim(side.key, Number(event.target.value))} type="number" value={selectedTrim[side.key]} />
                    <span className="text-[10px] text-black/35">px</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="rounded-lg border border-black/10 py-2 text-xs font-semibold hover:bg-black/[0.03]" onClick={() => setTrims((current) => ({ ...current, [selectedTile]: { ...ZERO_TRIM } }))} type="button">清零当前格</button>
                <button className="rounded-lg bg-[#fff0eb] py-2 text-xs font-semibold text-[#c93413] hover:bg-[#ffe5dc]" onClick={applyTrimToAll} type="button">应用到全部格</button>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="mb-4 text-sm font-bold">输出格式</div>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((option) => (
                <button aria-label={`输出格式 ${option.label}`} aria-pressed={format === option.value} className={`rounded-xl border px-1 py-3 transition ${format === option.value ? "border-[#ff5b35] bg-[#fff2ed] text-[#c93413]" : "border-black/10 bg-white hover:border-black/30"}`} key={option.value} onClick={() => setFormat(option.value)} type="button">
                  <span className="block text-sm font-bold">{option.label}</span>
                  <span className="mt-0.5 block text-[10px] opacity-60">{option.note}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-[#1d1d19] p-5 text-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-white/55">将生成</div>
                <div className="mt-1 text-3xl font-bold">{columns * rows} <span className="text-sm font-normal text-white/55">张图片</span></div>
              </div>
              {selectedTileData && <div className="text-right text-xs leading-5 text-white/55">当前格<br />{selectedTileData.width} × {selectedTileData.height}px</div>}
            </div>
            <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6846] font-bold text-white transition hover:bg-[#ff795d] disabled:opacity-40" disabled={!source || isExporting} onClick={handleExport} type="button">
              {isExporting ? <LoaderCircle className="animate-spin" size={18} /> : <Download size={18} />}
              {isExporting ? "正在打包..." : "下载 ZIP 压缩包"}
            </button>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/45"><ShieldCheck size={13} />图片仅在本地浏览器处理</div>
          </section>
          {error && <p className="m-0 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        </aside>

        <section className="order-1 flex min-h-[580px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:order-2">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-3">
            <div>
              <h2 className="m-0 text-sm font-bold">裁剪区域</h2>
              <p className="m-0 mt-1 text-xs text-black/45">白线标记宫格；点击格子后，拖动独立橙色四边进行裁剪</p>
            </div>
            <div className="flex gap-2">
              {source && <button className="flex h-9 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-xs font-semibold hover:bg-black/[0.03]" onClick={() => setCrop(FULL_CROP)} type="button"><RotateCcw size={14} />重置区域</button>}
              <button className="flex h-9 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-black/80" onClick={() => fileInputRef.current?.click()} type="button"><Upload size={14} />{source ? "更换图片" : "上传图片"}</button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#ececea] p-4 sm:p-8">
            {!source ? (
              <button className={`group flex min-h-[370px] w-full max-w-[680px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition ${isDraggingFile ? "border-[#ff6846] bg-[#fff4f0]" : "border-black/15 bg-white/55 hover:border-black/30 hover:bg-white/80"}`} onClick={() => fileInputRef.current?.click()} onDragEnter={() => setIsDraggingFile(true)} onDragLeave={() => setIsDraggingFile(false)} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} type="button">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-black shadow-sm transition group-hover:-translate-y-1"><ImagePlus size={27} /></span>
                <span className="mt-5 text-base font-bold">点击或拖入一张宫格图片</span>
                <span className="mt-2 text-xs text-black/45">支持 PNG、JPG、WebP 等常见格式</span>
              </button>
            ) : (
              <div className="max-h-full max-w-full select-none">
                <div className="relative inline-block max-h-full max-w-full touch-none shadow-[0_18px_50px_rgba(0,0,0,0.18)]" onPointerDown={(event) => startDrag(event, "draw")} onPointerMove={movePointer} onPointerUp={finishDrag} ref={stageRef}>
                  <img alt="待切割图片" className="block max-h-[680px] max-w-full object-contain" draggable={false} onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} ref={imageRef} src={source} />
                  <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/60" style={{ height: percent(crop.y) }} />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/60" style={{ height: percent(1 - crop.y - crop.height) }} />
                  <div className="pointer-events-none absolute left-0 bg-black/60" style={{ top: percent(crop.y), height: percent(crop.height), width: percent(crop.x) }} />
                  <div className="pointer-events-none absolute right-0 bg-black/60" style={{ top: percent(crop.y), height: percent(crop.height), width: percent(1 - crop.x - crop.width) }} />
                  <div className="pointer-events-none absolute z-10 border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" style={{ left: percent(crop.x), top: percent(crop.y), width: percent(crop.width), height: percent(crop.height) }}>
                    {Array.from({ length: columns * rows }, (_, index) => {
                      const row = Math.floor(index / columns);
                      const column = index % columns;
                      const horizontal = cellBounds(columnCuts, column);
                      const vertical = cellBounds(rowCuts, row);
                      return (
                        <button
                          aria-label={`选择第 ${index + 1} 格`}
                          aria-pressed={selectedTile === index}
                          className={`pointer-events-auto absolute z-10 border-0 bg-transparent transition hover:bg-[#ff6846]/10 ${selectedTile === index ? "bg-[#ff6846]/10" : ""}`}
                          key={`cell-${index}`}
                          onClick={(event) => { event.stopPropagation(); setSelectedTile(index); }}
                          onPointerDown={(event) => event.stopPropagation()}
                          style={{ left: percent(horizontal.start), top: percent(vertical.start), width: percent(horizontal.end - horizontal.start), height: percent(vertical.end - vertical.start) }}
                          type="button"
                        />
                      );
                    })}
                    {columnCuts.map((cut, index) => <span className="absolute inset-y-0 z-30 w-px bg-white shadow-[1px_0_0_rgba(0,0,0,0.45)]" key={`column-${index}`} style={{ left: percent(cut) }} />)}
                    {rowCuts.map((cut, index) => <span className="absolute inset-x-0 z-30 h-px bg-white shadow-[0_1px_0_rgba(0,0,0,0.45)]" key={`row-${index}`} style={{ top: percent(cut) }} />)}
                    {handles.map((handle) => <button aria-label={`调整裁剪区域 ${handle.mode}`} className={`pointer-events-auto absolute z-40 h-3 w-3 rounded-full border border-black/40 bg-white shadow ${handle.className}`} key={handle.mode} onPointerDown={(event) => startDrag(event, handle.mode)} style={{ cursor: handle.cursor }} type="button" />)}
                    <button aria-label="移动整个裁剪区域" className="pointer-events-auto absolute left-2 top-2 z-40 cursor-move rounded border-0 bg-black/65 px-2 py-1 text-[10px] font-semibold text-white" onPointerDown={(event) => startDrag(event, "move")} type="button">{columns} × {rows}</button>
                  </div>
                  {tiles.map((tile, index) => (
                    <div className={`pointer-events-none absolute z-20 ${selectedTile === index ? "border-2 border-[#ff4f28] shadow-[0_0_0_1px_white]" : "border border-[#ff6846]/70"}`} key={`trim-${index}`} style={{ left: percent(tile.x / imageSize.width), top: percent(tile.y / imageSize.height), width: percent(tile.width / imageSize.width), height: percent(tile.height / imageSize.height) }}>
                      <span className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${selectedTile === index ? "bg-[#ff4f28] text-white" : "bg-black/55 text-white/80"}`}>{index + 1}</span>
                      {selectedTile === index && (
                        <>
                          <button aria-label="拖动当前格上边裁剪线" className="pointer-events-auto absolute -left-0.5 -right-0.5 -top-2 h-4 cursor-ns-resize border-0 bg-transparent p-0" onPointerDown={(event) => startTrimDrag(event, "trim-top")} type="button"><span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#ff4f28]" /></button>
                          <button aria-label="拖动当前格右边裁剪线" className="pointer-events-auto absolute -bottom-0.5 -right-2 -top-0.5 w-4 cursor-ew-resize border-0 bg-transparent p-0" onPointerDown={(event) => startTrimDrag(event, "trim-right")} type="button"><span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#ff4f28]" /></button>
                          <button aria-label="拖动当前格下边裁剪线" className="pointer-events-auto absolute -bottom-2 -left-0.5 -right-0.5 h-4 cursor-ns-resize border-0 bg-transparent p-0" onPointerDown={(event) => startTrimDrag(event, "trim-bottom")} type="button"><span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#ff4f28]" /></button>
                          <button aria-label="拖动当前格左边裁剪线" className="pointer-events-auto absolute -bottom-0.5 -left-2 -top-0.5 w-4 cursor-ew-resize border-0 bg-transparent p-0" onPointerDown={(event) => startTrimDrag(event, "trim-left")} type="button"><span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#ff4f28]" /></button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <input accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} type="file" />
          </div>
          {source && <div className="flex items-center justify-between border-t border-black/10 px-5 py-3 text-xs text-black/45"><span className="max-w-[60%] truncate">{filename}</span><span>{imageSize.width} × {imageSize.height}px</span></div>}
        </section>
      </div>
    </main>
  );
}
