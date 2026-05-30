import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getThemeById } from "@/lib/themes";
import { RenderedPage } from "./RenderedPage";

describe("RenderedPage", () => {
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
});
