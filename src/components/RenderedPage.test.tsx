import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getThemeById } from "@/lib/themes";
import { RenderedPage } from "./RenderedPage";

describe("RenderedPage", () => {
  const basePage = {
    id: "page-1",
    manualGroupIndex: 0,
    estimatedHeight: 0,
    blocks: [
      {
        type: "paragraph" as const,
        text: "正文内容",
        inline: [{ type: "text" as const, text: "正文内容" }],
      },
    ],
  };

  it("renders inline Markdown nodes with semantic elements", () => {
    render(
      <RenderedPage
        page={{
          id: "page-1",
          manualGroupIndex: 0,
          estimatedHeight: 0,
          blocks: [
            {
              type: "paragraph",
              text: "Bold marked code",
              inline: [
                { type: "strong", children: [{ type: "text", text: "Bold" }] },
                { type: "text", text: " " },
                { type: "mark", children: [{ type: "text", text: "marked" }] },
                { type: "text", text: " " },
                { type: "inlineCode", code: "code" },
              ],
            },
          ],
        }}
        theme={getThemeById("punk")}
        dimensions={{ width: 1080, height: 1440 }}
        typography={{
          fontFamily: '"LikeJianJianTi", "PingFang SC", sans-serif',
          fontSize: 52,
        }}
      />,
    );

    expect(screen.getByText("Bold").closest("strong")).not.toBeNull();
    expect(screen.getByText("marked").closest("mark")).not.toBeNull();
    expect(screen.getByText("code").closest("code")).not.toBeNull();
    expect(screen.getByRole("article")).toHaveStyle({
      "--page-font": '"LikeJianJianTi", "PingFang SC", sans-serif',
      "--page-base": "52px",
    });
  });

  it("adds iPhone Notes chrome for the notes theme", () => {
    const { container } = render(
      <RenderedPage
        page={{
          id: "page-1",
          manualGroupIndex: 0,
          estimatedHeight: 0,
          blocks: [
            {
              type: "heading",
              depth: 1,
              text: "维港的风",
              inline: [{ type: "text", text: "维港的风" }],
            },
            {
              type: "list",
              ordered: false,
              items: [
                {
                  text: "一点船鸣",
                  inline: [{ type: "text", text: "一点船鸣" }],
                },
              ],
            },
          ],
        }}
        theme={getThemeById("iphone-notes")}
        dimensions={{ width: 1080, height: 1440 }}
      />,
    );

    expect(container.querySelector(".theme-iphone-notes")).not.toBeNull();
    expect(container.querySelector(".iphone-notes-topbar")).not.toBeNull();
    expect(container.querySelector(".iphone-notes-date")).toBeNull();
    expect(container.querySelector(".iphone-notes-bottombar")).not.toBeNull();
    expect(screen.getByText("维港的风").closest("h1")).not.toBeNull();
    expect(screen.getByText("一点船鸣").closest("li")).not.toBeNull();
  });

  it("shows image captions only when Markdown provides a description", () => {
    render(
      <RenderedPage
        page={{
          id: "page-1",
          manualGroupIndex: 0,
          estimatedHeight: 0,
          blocks: [
            {
              type: "image",
              alt: "夕阳下的胡同",
              url: "https://example.com/hutong.jpg",
            },
            {
              type: "image",
              alt: "",
              url: "https://example.com/no-caption.jpg",
            },
          ],
        }}
        theme={getThemeById("punk")}
        dimensions={{ width: 1080, height: 1440 }}
      />,
    );

    expect(screen.getByText("夕阳下的胡同").closest("figcaption")).not.toBeNull();
    expect(screen.queryByText("Markdown 图片")).toBeNull();
  });

  it("renders local image references through loaded image sources", () => {
    render(
      <RenderedPage
        page={{
          id: "page-1",
          manualGroupIndex: 0,
          estimatedHeight: 0,
          blocks: [
            {
              type: "image",
              alt: "本地图",
              url: "local-image://cover-1",
            },
          ],
        }}
        theme={getThemeById("punk")}
        dimensions={{ width: 1080, height: 1440 }}
        localImageSources={{
          "local-image://cover-1": "data:image/png;base64,abc",
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "本地图" })).toHaveAttribute(
      "src",
      "data:image/png;base64,abc",
    );
  });

  it("renders the author watermark with avatar and author name", () => {
    const { container } = render(
      <RenderedPage
        page={basePage}
        theme={getThemeById("punk")}
        dimensions={{ width: 1080, height: 1440 }}
        watermark={{
          enabled: true,
          authorName: "卡卡罗特AI",
          avatarSrc: "/watermark-avatar.jpg",
        }}
      />,
    );

    expect(screen.getByText("卡卡罗特AI").closest(".xhs-watermark")).not.toBeNull();
    expect(screen.getByRole("img", { name: "作者头像" })).toHaveAttribute(
      "src",
      "/watermark-avatar.jpg",
    );
    expect(container.querySelector(".xhs-watermark")).not.toBeNull();
  });

  it("renders the author watermark without an avatar", () => {
    render(
      <RenderedPage
        page={basePage}
        theme={getThemeById("punk")}
        dimensions={{ width: 1080, height: 1440 }}
        watermark={{
          enabled: true,
          authorName: "卡卡罗特AI",
          avatarSrc: null,
        }}
      />,
    );

    expect(screen.getByText("卡卡罗特AI").closest(".xhs-watermark")).not.toBeNull();
    expect(screen.queryByRole("img", { name: "作者头像" })).not.toBeInTheDocument();
  });

  it("omits the author watermark when disabled", () => {
    const { container } = render(
      <RenderedPage
        page={basePage}
        theme={getThemeById("punk")}
        dimensions={{ width: 1080, height: 1440 }}
        watermark={{
          enabled: false,
          authorName: "卡卡罗特AI",
          avatarSrc: "/watermark-avatar.jpg",
        }}
      />,
    );

    expect(container.querySelector(".xhs-watermark")).toBeNull();
    expect(screen.queryByText("卡卡罗特AI")).not.toBeInTheDocument();
  });
});
