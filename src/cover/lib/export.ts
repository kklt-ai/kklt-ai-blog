import { toBlob } from "html-to-image";
import type { CoverChannelId } from "./cover";

const IMAGE_LOAD_TIMEOUT_MS = 4000;

function waitForImages(node: HTMLElement, timeoutMs = IMAGE_LOAD_TIMEOUT_MS) {
  const images = Array.from(node.querySelectorAll("img"));
  const pendingImages = images.filter((img) => !img.complete);
  if (!pendingImages.length) return Promise.resolve();

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

  return Promise.race([waitForImageSettles, timeout]);
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

export function exportCoverFilename(channelId: CoverChannelId) {
  return `cover-${channelId}.png`;
}

export async function coverNodeToPngBlob(node: HTMLElement) {
  await waitForImages(node);
  const blob = await toBlob(node, {
    pixelRatio: 1,
    backgroundColor: "#ffffff",
    includeQueryParams: true,
    skipFonts: true,
  });

  if (!blob) throw new Error("导出失败，请重试");
  return blob;
}

export async function downloadCoverNodeAsPng(
  node: HTMLElement,
  channelId: CoverChannelId,
) {
  const blob = await coverNodeToPngBlob(node);
  downloadBlob(blob, exportCoverFilename(channelId));
}
