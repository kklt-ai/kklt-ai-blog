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
});
