import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CoverPreviewPanel } from "./CoverPreviewPanel";

function renderPreviewPanel(centerGuides = { vertical: false, horizontal: false }) {
  render(
    <CoverPreviewPanel
      canvasRef={createRef<HTMLDivElement>()}
      channelWidth={1242}
      channelHeight={1660}
      canvasScale={0.36}
      canvasStyle={{ width: "1242px", height: "1660px" }}
      selectedBackground={{ kind: "color", id: "test", className: "bg-white" }}
      selectedBackgroundClassName="bg-white"
      selectedBackgroundStyle={{}}
      layers={[]}
      selectedLayerId=""
      editingLayerId={null}
      centerGuides={centerGuides}
      onWheel={vi.fn()}
      onPointerMove={vi.fn()}
      onPointerEnd={vi.fn()}
      onSelectLayer={vi.fn()}
      onBeginDrag={vi.fn()}
      onEditTextLayer={vi.fn()}
      onTextLayerChange={vi.fn()}
      onFinishEditing={vi.fn()}
      onDeleteLayer={vi.fn()}
      onOpenSaveTemplateDialog={vi.fn()}
      onCopyTemplateConfig={vi.fn()}
      templateActionMessage=""
      boardStrip={<div data-testid="board-strip">画板条</div>}
    />,
  );
}

describe("CoverPreviewPanel", () => {
  it("shows center guide lines for active snap directions", () => {
    renderPreviewPanel({ vertical: true, horizontal: true });

    expect(screen.getByLabelText("垂直居中参考线")).toBeInTheDocument();
    expect(screen.getByLabelText("水平居中参考线")).toBeInTheDocument();
  });

  it("hides center guide lines when no snap direction is active", () => {
    renderPreviewPanel();

    expect(screen.queryByLabelText("垂直居中参考线")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("水平居中参考线")).not.toBeInTheDocument();
  });

  it("anchors the board strip at the bottom without reserving extra preview padding", () => {
    renderPreviewPanel();

    expect(screen.getByLabelText("封面预览面板")).toHaveClass(
      "gap-2",
      "bg-[#fcfaf8]",
      "py-3",
    );
    expect(screen.getByLabelText("封面画布").closest("[data-cover-preview-surface='true']")).toHaveClass(
      "bg-[#efebe3]",
      "border-[#979696]/35",
      "min-h-0",
      "flex-1",
    );
    expect(screen.getByTestId("board-strip").parentElement).toHaveClass("mt-auto", "shrink-0");
  });
});
