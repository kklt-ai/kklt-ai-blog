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

function localPathFromSrc(src: string) {
  if (src.startsWith("file://")) return new URL(src);
  if (path.isAbsolute(src)) return src;
  return path.resolve(process.cwd(), src);
}

async function fetchRemoteImage(src: string) {
  const upstream = await fetch(src, {
    headers: {
      Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; kklt-md-img/1.0)",
    },
  });

  if (!upstream.ok) {
    return new Response("Image fetch failed", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? imageContentType(src);
  if (!contentType.toLowerCase().startsWith("image/")) {
    return new Response("URL is not an image", { status: 415 });
  }

  return inlineImageResponse(await upstream.arrayBuffer(), contentType);
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
