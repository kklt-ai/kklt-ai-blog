import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearExportResourceCache,
  downloadNodesAsZip,
  downloadNodeAsPng,
  exportPageFilename,
  exportZipFilename,
} from "./export";
import { getFontEmbedCSS, toBlob } from "html-to-image";

vi.mock("html-to-image", () => ({
  getFontEmbedCSS: vi.fn(async () => "@font-face { font-family: TestFont; }"),
  toBlob: vi.fn(async () => new Blob(["exported"], { type: "image/png" })),
}));

function readBlobAsText(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe("downloadNodeAsPng", () => {
  let clickSpy: ReturnType<typeof vi.spyOn>;
  let createObjectUrlSpy: ReturnType<typeof vi.fn>;
  let revokeObjectUrlSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    createObjectUrlSpy = vi.fn(() => "blob:http://localhost/exported");
    revokeObjectUrlSpy = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectUrlSpy,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectUrlSpy,
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    clickSpy.mockRestore();
    delete (URL as Partial<typeof URL>).createObjectURL;
    delete (URL as Partial<typeof URL>).revokeObjectURL;
    clearExportResourceCache();
    vi.clearAllMocks();
  });

  function createExportNode(fontFamily = '"Yozai", "PingFang SC", sans-serif') {
    const wrapper = document.createElement("div");
    const page = document.createElement("article");
    page.className = "xhs-page";
    page.style.fontFamily = fontFamily;
    wrapper.append(page);
    document.body.append(wrapper);
    return wrapper;
  }

  it("reuses embedded font CSS across exports with the same page font", async () => {
    const firstNode = createExportNode();
    const secondNode = createExportNode();

    await downloadNodeAsPng(firstNode, "first.png");
    await downloadNodeAsPng(secondNode, "second.png");

    expect(getFontEmbedCSS).toHaveBeenCalledTimes(1);
    expect(toBlob).toHaveBeenCalledTimes(2);
    expect(toBlob).toHaveBeenNthCalledWith(
      1,
      firstNode,
      expect.objectContaining({
        fontEmbedCSS: "@font-face { font-family: TestFont; }",
      }),
    );
    expect(toBlob).toHaveBeenNthCalledWith(
      2,
      secondNode,
      expect.objectContaining({
        fontEmbedCSS: "@font-face { font-family: TestFont; }",
      }),
    );
  });

  it("downloads PNGs through blob URLs instead of base64 data URLs", async () => {
    const node = createExportNode();

    await downloadNodeAsPng(node, "page.png");

    expect(toBlob).toHaveBeenCalledTimes(1);
    expect(createObjectUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(document.querySelector("a")).not.toBeInTheDocument();
  });

  it("skips webfont embedding for system font stacks", async () => {
    const node = createExportNode(
      '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    );

    await downloadNodeAsPng(node, "system-font.png");

    expect(getFontEmbedCSS).not.toHaveBeenCalled();
    expect(toBlob).toHaveBeenCalledWith(
      node,
      expect.objectContaining({
        skipFonts: true,
      }),
    );
  });
});

describe("export filenames", () => {
  it("uses the kklt AI public-account prefix with local date and page number", () => {
    const date = new Date(2026, 4, 31);

    expect(exportPageFilename(0, date)).toBe("【卡卡罗特AI】-2026-05-31-第1页.png");
    expect(exportPageFilename(11, date)).toBe("【卡卡罗特AI】-2026-05-31-第12页.png");
    expect(exportZipFilename(date)).toBe("【卡卡罗特AI】-2026-05-31.zip");
  });
});

describe("downloadNodesAsZip", () => {
  let clickSpy: ReturnType<typeof vi.spyOn>;
  let createObjectUrlSpy: ReturnType<typeof vi.fn>;
  let downloadedBlob: Blob | null;

  beforeEach(() => {
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    downloadedBlob = null;
    createObjectUrlSpy = vi.fn((blob: Blob) => {
      downloadedBlob = blob;
      return "blob:http://localhost/exported-zip";
    });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectUrlSpy,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    clickSpy.mockRestore();
    delete (URL as Partial<typeof URL>).createObjectURL;
    delete (URL as Partial<typeof URL>).revokeObjectURL;
    clearExportResourceCache();
    vi.clearAllMocks();
  });

  function createExportNode(fontFamily = '"Yozai", "PingFang SC", sans-serif') {
    const wrapper = document.createElement("div");
    const page = document.createElement("article");
    page.className = "xhs-page";
    page.style.fontFamily = fontFamily;
    wrapper.append(page);
    document.body.append(wrapper);
    return wrapper;
  }

  it("downloads all PNG nodes as one zip with dated entry names", async () => {
    const firstNode = createExportNode();
    const secondNode = createExportNode();

    await downloadNodesAsZip(
      [
        { node: firstNode, filename: "【卡卡罗特AI】-2026-05-31-第1页.png" },
        { node: secondNode, filename: "【卡卡罗特AI】-2026-05-31-第2页.png" },
      ],
      "【卡卡罗特AI】-2026-05-31.zip",
    );

    expect(toBlob).toHaveBeenCalledTimes(2);
    expect(createObjectUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const link = document.querySelector("a");
    expect(link).not.toBeInTheDocument();
    expect(downloadedBlob?.type).toBe("application/zip");

    const zipText = await readBlobAsText(downloadedBlob!);
    expect(zipText).toContain("【卡卡罗特AI】-2026-05-31-第1页.png");
    expect(zipText).toContain("【卡卡罗特AI】-2026-05-31-第2页.png");
    expect(zipText).not.toContain("xiaohongshu-page");
  });
});
