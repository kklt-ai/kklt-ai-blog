const PROXY_PATH = "/api/image";

function shouldProxyImageSrc(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (/^(data|blob):/i.test(trimmed)) return false;
  if (trimmed.startsWith(PROXY_PATH)) return false;
  return true;
}

export function resolveImageSrc(src: string) {
  const trimmed = src.trim();
  if (!shouldProxyImageSrc(trimmed)) return trimmed;
  return `${PROXY_PATH}?src=${encodeURIComponent(trimmed)}`;
}
