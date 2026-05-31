import { getFontEmbedCSS, toBlob } from "html-to-image";

const IMAGE_LOAD_TIMEOUT_MS = 4000;
const REMOTE_FONT_FAMILIES = [
  "LikeJianJianTi",
  "Xiaolai Mono",
  "Yozai",
  "851tegakizatsu",
  "PING FANG ZHUI FENG",
  "JasonHandwriting7",
];
const fontEmbedCssCache = new Map<string, Promise<string>>();

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
