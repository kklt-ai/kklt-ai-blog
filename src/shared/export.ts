import { getFontEmbedCSS, toBlob } from "html-to-image";

const IMAGE_LOAD_TIMEOUT_MS = 4000;
const EXPORT_FILENAME_PREFIX = "【卡卡罗特AI】";
const ZIP_UTF8_FLAG = 0x0800;
const REMOTE_FONT_FAMILIES = [
  "LikeJianJianTi",
  "Xiaolai Mono",
  "Yozai",
  "851tegakizatsu",
  "PING FANG ZHUI FENG",
  "JasonHandwriting7",
];
const fontEmbedCssCache = new Map<string, Promise<string>>();
let crc32Table: Uint32Array | null = null;

type ZipSourceFile = {
  filename: string;
  data: ArrayBuffer;
};

type ZipEntrySource = {
  node: HTMLElement;
  filename: string;
};

function pageFontFamily(node: HTMLElement) {
  const page = node.querySelector<HTMLElement>(".xhs-page") ?? node;
  return window.getComputedStyle(page).fontFamily || page.style.fontFamily || "";
}

function usesRemoteFont(fontFamily: string) {
  const normalized = fontFamily.toLowerCase();
  return REMOTE_FONT_FAMILIES.some((family) =>
    normalized.includes(family.toLowerCase()),
  );
}

async function waitForDocumentFonts() {
  const fonts = document.fonts;
  if (!fonts) return;

  try {
    await fonts.ready;
  } catch {
    // Export can still proceed; html-to-image will use available fallbacks.
  }
}

async function fontEmbedCSSForNode(node: HTMLElement, fontFamily: string) {
  const cached = fontEmbedCssCache.get(fontFamily);
  if (cached) return cached;

  const cssPromise = getFontEmbedCSS(node, {
    includeQueryParams: true,
  }).catch((error) => {
    fontEmbedCssCache.delete(fontFamily);
    throw error;
  });
  fontEmbedCssCache.set(fontFamily, cssPromise);
  return cssPromise;
}

/**
 * Wait for all images inside a node to finish loading (or fail).
 * This avoids html-to-image spending time waiting for image loads
 * during the clone-and-embed phase.
 */
async function waitForImages(node: HTMLElement, timeoutMs = IMAGE_LOAD_TIMEOUT_MS) {
  const images = Array.from(node.querySelectorAll("img"));
  const pendingImages = images.filter((img) => !img.complete);
  if (!pendingImages.length) return;

  const waitForImageSettles = Promise.allSettled(
    pendingImages.map(
      (img) =>
        new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
    ),
  );
  const timeout = new Promise<void>((resolve) => {
    window.setTimeout(resolve, timeoutMs);
  });

  await Promise.race([waitForImageSettles, timeout]);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();

  window.setTimeout(() => {
    if (typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(url);
    }
  }, 0);
}

function toPngOptions(fontEmbedCSS: string | null) {
  return {
    pixelRatio: 1,
    backgroundColor: "#ffffff",
    // Proxy URLs carry the real src as a query param; include it in the
    // cache key so different images don't collide on the same key.
    includeQueryParams: true,
    ...(fontEmbedCSS === null
      ? { skipFonts: true }
      : { fontEmbedCSS }),
  };
}

function blobToArrayBuffer(blob: Blob) {
  if (typeof blob.arrayBuffer === "function") return blob.arrayBuffer();

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
        return;
      }
      reject(new Error("导出失败，请重试"));
    };
    reader.onerror = () => reject(new Error("导出失败，请重试"));
    reader.readAsArrayBuffer(blob);
  });
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function formatExportDate(date: Date) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

export function exportPageFilename(pageIndex: number, date = new Date()) {
  return `${EXPORT_FILENAME_PREFIX}-${formatExportDate(date)}-第${pageIndex + 1}页.png`;
}

export function exportZipFilename(date = new Date()) {
  return `${EXPORT_FILENAME_PREFIX}-${formatExportDate(date)}.zip`;
}

function getCrc32Table() {
  if (crc32Table) return crc32Table;

  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }

  crc32Table = table;
  return table;
}

function crc32(data: Uint8Array) {
  const table = getCrc32Table();
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index += 1) {
    crc = table[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

  return { dosDate, dosTime };
}

function createZipBlob(files: ZipSourceFile[], modifiedAt = new Date()) {
  const encoder = new TextEncoder();
  const { dosDate, dosTime } = dosDateTime(modifiedAt);
  const chunks: BlobPart[] = [];
  const centralDirectoryChunks: BlobPart[] = [];
  let offset = 0;
  let centralDirectorySize = 0;

  files.forEach((file) => {
    const filenameBytes = encoder.encode(file.filename);
    const fileBytes = new Uint8Array(file.data);
    const checksum = crc32(fileBytes);
    const localHeader = new ArrayBuffer(30);
    const localView = new DataView(localHeader);

    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, ZIP_UTF8_FLAG, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, fileBytes.byteLength, true);
    localView.setUint32(22, fileBytes.byteLength, true);
    localView.setUint16(26, filenameBytes.byteLength, true);
    localView.setUint16(28, 0, true);

    chunks.push(localHeader, filenameBytes, file.data);

    const centralHeader = new ArrayBuffer(46);
    const centralView = new DataView(centralHeader);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, ZIP_UTF8_FLAG, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, fileBytes.byteLength, true);
    centralView.setUint32(24, fileBytes.byteLength, true);
    centralView.setUint16(28, filenameBytes.byteLength, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    centralDirectoryChunks.push(centralHeader, filenameBytes);

    offset += localHeader.byteLength + filenameBytes.byteLength + fileBytes.byteLength;
    centralDirectorySize += centralHeader.byteLength + filenameBytes.byteLength;
  });

  const centralDirectoryOffset = offset;
  chunks.push(...centralDirectoryChunks);

  const endRecord = new ArrayBuffer(22);
  const endView = new DataView(endRecord);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralDirectorySize, true);
  endView.setUint32(16, centralDirectoryOffset, true);
  endView.setUint16(20, 0, true);
  chunks.push(endRecord);

  return new Blob(chunks, { type: "application/zip" });
}

export function clearExportResourceCache() {
  fontEmbedCssCache.clear();
}

export async function prepareNodeForPng(node: HTMLElement) {
  const fontFamily = pageFontFamily(node);
  const shouldEmbedRemoteFont = usesRemoteFont(fontFamily);

  await Promise.all([
    waitForImages(node),
    shouldEmbedRemoteFont ? waitForDocumentFonts() : Promise.resolve(),
  ]);

  return shouldEmbedRemoteFont ? fontEmbedCSSForNode(node, fontFamily) : null;
}

export async function nodeToPngBlob(node: HTMLElement) {
  const fontEmbedCSS = await prepareNodeForPng(node);
  const blob = await toBlob(
    node,
    toPngOptions(fontEmbedCSS),
  );

  if (!blob) throw new Error("导出失败，请重试");
  return blob;
}

export async function downloadNodeAsPng(node: HTMLElement, filename: string) {
  const blob = await nodeToPngBlob(node);
  downloadBlob(blob, filename);
}

export async function downloadNodesAsZip(entries: ZipEntrySource[], filename: string) {
  const files: ZipSourceFile[] = [];

  for (const entry of entries) {
    const blob = await nodeToPngBlob(entry.node);
    files.push({
      filename: entry.filename,
      data: await blobToArrayBuffer(blob),
    });
  }

  downloadBlob(createZipBlob(files), filename);
}
