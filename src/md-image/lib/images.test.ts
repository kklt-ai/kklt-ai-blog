import { describe, expect, it } from "vitest";
import { resolveImageSrc } from "./images";

describe("resolveImageSrc", () => {
  it("proxies remote image URLs so attachment responses can render inline", () => {
    const src = resolveImageSrc("https://cdn.nlark.com/a.jpeg");

    expect(src).toBe("/api/image?src=https%3A%2F%2Fcdn.nlark.com%2Fa.jpeg");
  });

  it("proxies absolute and relative local image paths", () => {
    expect(resolveImageSrc("/Users/me/Pictures/a.png")).toBe(
      "/api/image?src=%2FUsers%2Fme%2FPictures%2Fa.png",
    );
    expect(resolveImageSrc("./images/a.png")).toBe(
      "/api/image?src=.%2Fimages%2Fa.png",
    );
  });

  it("leaves browser-native image sources unchanged", () => {
    expect(resolveImageSrc("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
    expect(resolveImageSrc("blob:http://localhost/abc")).toBe("blob:http://localhost/abc");
  });

  it("resolves local image references from the loaded image library", () => {
    expect(
      resolveImageSrc("local-image://cover-1", {
        "local-image://cover-1": "data:image/png;base64,abc",
      }),
    ).toBe("data:image/png;base64,abc");
  });
});
