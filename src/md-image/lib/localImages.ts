export const LOCAL_IMAGE_PREFIX = "local-image://";

const DB_NAME = "xhs-md-image-tool-images";
const STORE_NAME = "images";
const DB_VERSION = 1;

export type LocalImageRecord = {
  ref: string;
  name: string;
  type: string;
  dataUrl: string;
  createdAt: number;
};

export type LocalImageSources = Record<string, string>;

function slugifyFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const slug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug && /[a-z]/.test(slug) ? slug : "image";
}

function uniqueImagePart() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function openLocalImageDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "ref" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openLocalImageDb();
  try {
    const transaction = db.transaction(STORE_NAME, mode);
    return await requestToPromise(callback(transaction.objectStore(STORE_NAME)));
  } finally {
    db.close();
  }
}

export function createLocalImageRef(fileName: string, uniquePart = uniqueImagePart()) {
  return `${LOCAL_IMAGE_PREFIX}${slugifyFileName(fileName)}-${uniquePart}`;
}

export function isLocalImageSrc(src: string) {
  return src.trim().startsWith(LOCAL_IMAGE_PREFIX);
}

export function extractLocalImageRefs(markdown: string) {
  return Array.from(
    markdown.matchAll(/local-image:\/\/[^\s)>\]]+/g),
    (match) => match[0],
  );
}

export function findUnusedLocalImageRefs(allRefs: string[], markdown: string) {
  const usedRefs = new Set(extractLocalImageRefs(markdown));
  return allRefs.filter((ref) => !usedRefs.has(ref));
}

export async function saveLocalImage(file: File, dataUrl: string) {
  const record: LocalImageRecord = {
    ref: createLocalImageRef(file.name),
    name: file.name,
    type: file.type,
    dataUrl,
    createdAt: Date.now(),
  };

  await withStore("readwrite", (store) => store.put(record));
  return record;
}

export async function loadLocalImageSources(markdown: string): Promise<LocalImageSources> {
  const refs = Array.from(new Set(extractLocalImageRefs(markdown)));
  const entries = await Promise.all(
    refs.map(async (ref) => {
      const record = await withStore<LocalImageRecord | undefined>("readonly", (store) =>
        store.get(ref),
      );
      return record ? ([ref, record.dataUrl] as const) : null;
    }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is readonly [string, string] => Boolean(entry)),
  );
}

export async function deleteUnusedLocalImages(markdown: string) {
  const records = await withStore<LocalImageRecord[]>("readonly", (store) => store.getAll());
  const unusedRefs = findUnusedLocalImageRefs(
    records.map((record) => record.ref),
    markdown,
  );

  await Promise.all(
    unusedRefs.map((ref) => withStore("readwrite", (store) => store.delete(ref))),
  );

  return unusedRefs.length;
}
