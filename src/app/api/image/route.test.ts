import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("/api/image", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches remote images and returns an inline image response", async () => {
    const body = new Uint8Array([1, 2, 3]);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(body, {
        status: 200,
        headers: {
          "content-type": "image/jpeg",
          "content-disposition": "attachment; filename=broken.jpg",
        },
      }),
    );

    const response = await GET(
      new Request("http://localhost/api/image?src=https%3A%2F%2Fcdn.example.com%2Fa.jpg"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("content-disposition")).toBe("inline");
    expect(await response.arrayBuffer()).toEqual(body.buffer);
  });

  it("deduplicates concurrent remote image fetches for the same URL", async () => {
    const body = new Uint8Array([4, 5, 6]);
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      new Response(new Uint8Array(body), {
        status: 200,
        headers: {
          "content-type": "image/png",
        },
      }),
    );

    const src = encodeURIComponent("https://cdn.example.com/shared.png");
    const [firstResponse, secondResponse] = await Promise.all([
      GET(new Request(`http://localhost/api/image?src=${src}`)),
      GET(new Request(`http://localhost/api/image?src=${src}`)),
    ]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(await firstResponse.arrayBuffer()).toEqual(body.buffer);
    expect(await secondResponse.arrayBuffer()).toEqual(body.buffer);
  });
});
