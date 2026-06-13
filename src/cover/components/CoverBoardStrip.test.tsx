import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createCoverBoard } from "./coverBoards";
import { CoverBoardStrip } from "./CoverBoardStrip";
import { cloneTemplateLayers, getTemplatesByChannel } from "@/cover/lib/cover";

const template = getTemplatesByChannel("xiaohongshu")[0];
const board = createCoverBoard({
  id: "test-board",
  channelId: "xiaohongshu",
  templateId: template.id,
  selectedBackground: template.background,
  layers: cloneTemplateLayers(template),
});

describe("CoverBoardStrip", () => {
  it("collapses and expands the board previews from the header icon", () => {
    render(
      <CoverBoardStrip
        boards={[board]}
        activeBoardId={board.id}
        message=""
        onSelectBoard={vi.fn()}
        onAddBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("画板缩略图列表")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "收起画板列表" }));

    expect(screen.queryByLabelText("画板缩略图列表")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "展开画板列表" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    fireEvent.click(screen.getByRole("button", { name: "展开画板列表" }));

    expect(screen.getByLabelText("画板缩略图列表")).toBeInTheDocument();
  });

  it("keeps board controls compact so the preview can use more height", () => {
    render(
      <CoverBoardStrip
        boards={[board]}
        activeBoardId={board.id}
        message=""
        onSelectBoard={vi.fn()}
        onAddBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "收起画板列表" })).toHaveClass("h-9", "w-9");
    expect(screen.getByRole("button", { name: "选择画板 1" })).toHaveClass(
      "h-[72px]",
      "w-[64px]",
    );
    expect(screen.getByRole("button", { name: "新增画板" })).toHaveClass(
      "h-[72px]",
      "w-[64px]",
    );
  });
});
