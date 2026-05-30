import { describe, expect, it } from "vitest";
import {
  createLocalImageRef,
  extractLocalImageRefs,
  findUnusedLocalImageRefs,
  isLocalImageSrc,
} from "./localImages";

describe("local image references", () => {
  it("creates readable local-image references from file names", () => {
    expect(createLocalImageRef("Cover Photo.png", "abc123")).toBe(
      "local-image://cover-photo-abc123",
    );
    expect(createLocalImageRef("照片 01.png", "xyz")).toBe("local-image://image-xyz");
  });

  it("extracts local image refs used by Markdown", () => {
    const markdown = [
      "![封面](local-image://cover-1)",
      "regular text",
      "![详情](local-image://detail-2)",
      "![远程](https://example.com/a.png)",
    ].join("\n\n");

    expect(extractLocalImageRefs(markdown)).toEqual([
      "local-image://cover-1",
      "local-image://detail-2",
    ]);
  });

  it("finds local images that are no longer referenced", () => {
    expect(
      findUnusedLocalImageRefs(
        ["local-image://cover-1", "local-image://old-2"],
        "![封面](local-image://cover-1)",
      ),
    ).toEqual(["local-image://old-2"]);
  });

  it("identifies local image sources", () => {
    expect(isLocalImageSrc("local-image://cover-1")).toBe(true);
    expect(isLocalImageSrc("data:image/png;base64,abc")).toBe(false);
  });
});
