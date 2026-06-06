import { describe, expect, it } from "vitest";
import { exportCoverFilename } from "./export";
import type { CoverChannelId } from "./cover";

describe("cover export filenames", () => {
  it("keeps cover export naming in the cover feature", () => {
    expect(exportCoverFilename("xiaohongshu" satisfies CoverChannelId)).toBe(
      "cover-xiaohongshu.png",
    );
    expect(exportCoverFilename("wechat" satisfies CoverChannelId)).toBe("cover-wechat.png");
  });
});
