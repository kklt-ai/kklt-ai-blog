import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

type CachedImage = {
  body: ArrayBuffer;
  contentType: string;
  cachedAt: number;
};

type ImageFetchResult =
  | { ok: true; image: CachedImage }
  | { ok: false; message: string; status: number };

/** Simple in-memory cache for proxied images. */
const imageCache = new Map<string, CachedImage>();
const pendingRemoteImages = new Map<string, Promise<ImageFetchResult>>();
const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes server-side
const CACHE_MAX_ENTRIES = 50;

function imageContentType(src: string, fallback = "application/octet-stream") {
  const pathname = src.startsWith("http")
    ? new URL(src).pathname
    : src;
  return CONTENT_TYPES[path.extname(pathname).toLowerCase()] ?? fallback;
}

function inlineImageResponse(body: BodyInit, contentType: string) {
  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": "inline",
      "Content-Type": contentType,
    },
  });
}

function cachedImageResponse(image: CachedImage) {
  return inlineImageResponse(image.body.slice(0), image.contentType);
}

function localPathFromSrc(src: string) {
  if (src.startsWith("file://")) return new URL(src);
  if (path.isAbsolute(src)) return src;
  return path.resolve(process.cwd(), src);
}

function pruneImageCache() {
  const now = Date.now();
  const expired: string[] = [];

  imageCache.forEach((entry, key) => {
    if (now - entry.cachedAt > CACHE_MAX_AGE_MS) expired.push(key);
  });

  expired.forEach((key) => imageCache.delete(key));

  // If still over the limit after expiring old entries, evict oldest first
  if (imageCache.size > CACHE_MAX_ENTRIES) {
    const entries = Array.from(imageCache.entries()).sort(
      (a, b) => a[1].cachedAt - b[1].cachedAt,
    );
    const toDelete = entries.slice(0, imageCache.size - CACHE_MAX_ENTRIES);
    toDelete.forEach(([key]) => imageCache.delete(key));
  }
}

async function fetchRemoteImagePayload(src: string): Promise<ImageFetchResult> {
  const upstream = await fetch(src, {
    headers: {
      Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; kklt-md-img/1.0)",
    },
  });

  if (!upstream.ok) {
    return { ok: false, message: "Image fetch failed", status: upstream.status };
  }

  const contentType = upstream.headers.get("content-type") ?? imageContentType(src);
  if (!contentType.toLowerCase().startsWith("image/")) {
    return { ok: false, message: "URL is not an image", status: 415 };
  }

  const body = await upstream.arrayBuffer();
  const image = { body, contentType, cachedAt: Date.now() };
  imageCache.set(src, image);

  return { ok: true, image };
}

async function fetchRemoteImage(src: string) {
  pruneImageCache();
  const cached = imageCache.get(src);
  if (cached) return cachedImageResponse(cached);

  let pending = pendingRemoteImages.get(src);
  if (!pending) {
    pending = fetchRemoteImagePayload(src);
    pendingRemoteImages.set(src, pending);
    pending.finally(() => pendingRemoteImages.delete(src));
  }

  const result = await pending;
  if (!result.ok) {
    return new Response(result.message, { status: result.status });
  }

  return cachedImageResponse(result.image);
}

async function readLocalImage(src: string) {
  const filePath = localPathFromSrc(src);
  const contentType = imageContentType(src);

  if (!contentType.startsWith("image/")) {
    return new Response("File is not a supported image", { status: 415 });
  }

  try {
    const file = await readFile(filePath);
    return inlineImageResponse(file, contentType);
  } catch {
    return new Response("Image file not found", { status: 404 });
  }
}

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src")?.trim();
  if (!src) return new Response("Missing image src", { status: 400 });

  if (/^https?:\/\//i.test(src)) return fetchRemoteImage(src);
  return readLocalImage(src);
}
