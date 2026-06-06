import { isLocalImageSrc, type LocalImageSources } from "./localImages";

const PROXY_PATH = "/api/image";

function shouldProxyImageSrc(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (isLocalImageSrc(trimmed)) return false;
  if (/^(data|blob):/i.test(trimmed)) return false;
  if (trimmed.startsWith(PROXY_PATH)) return false;
  return true;
}

export function resolveImageSrc(src: string, localImageSources: LocalImageSources = {}) {
  const trimmed = src.trim();
  if (isLocalImageSrc(trimmed)) return localImageSources[trimmed] ?? "";
  if (!shouldProxyImageSrc(trimmed)) return trimmed;
  return `${PROXY_PATH}?src=${encodeURIComponent(trimmed)}`;
}
