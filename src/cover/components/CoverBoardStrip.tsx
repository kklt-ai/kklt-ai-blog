import { useState } from "react";
import { ChevronDown, ChevronUp, Layers, Plus, Trash2 } from "lucide-react";
import { imageBackgroundStyle } from "./backgroundStyles";
import type { CoverBoard } from "./coverBoards";

type CoverBoardStripProps = {
  boards: CoverBoard[];
  activeBoardId: string;
  message: string;
  onSelectBoard: (boardId: string) => void;
  onAddBoard: () => void;
  onDeleteBoard: (boardId: string) => void;
};

function boardPreviewText(board: CoverBoard) {
  const textLayer = board.layers.find((layer) => layer.type === "text");
  return textLayer?.type === "text" ? textLayer.text : "空白画板";
}

function boardPreviewStyle(board: CoverBoard) {
  if (board.selectedBackground.kind === "image") {
    return imageBackgroundStyle(board.selectedBackground);
  }
  return {};
}

export function CoverBoardStrip({
  boards,
  activeBoardId,
  message,
  onSelectBoard,
  onAddBoard,
  onDeleteBoard,
}: CoverBoardStripProps) {
  const [expanded, setExpanded] = useState(true);
  const activeIndex = Math.max(
    boards.findIndex((board) => board.id === activeBoardId),
    0,
  );
  const ToggleIcon = expanded ? ChevronDown : ChevronUp;

  return (
    <div
      aria-label="画板列表"
      className="overflow-hidden rounded-lg border border-[#979696]/35 bg-white/90 shadow-[0_12px_32px_rgba(38,37,30,0.10)] backdrop-blur"
    >
      <div className="flex items-center gap-2 border-b border-[#f3f0ef] p-2">
        <button
          type="button"
          aria-label={expanded ? "收起画板列表" : "展开画板列表"}
          aria-expanded={expanded}
          title={expanded ? "收起画板列表" : "展开画板列表"}
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#f3f0ef] bg-white text-[#26251e] shadow-sm transition hover:border-[#979696]/45 hover:bg-[#f6f1ea]"
        >
          <Layers size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`画板 ${activeIndex + 1}/${boards.length}`}
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#f3f0ef] bg-white px-3 text-sm font-semibold text-[#26251e] shadow-sm transition hover:border-[#979696]/45 hover:bg-[#f6f1ea]"
        >
          画板 {activeIndex + 1}/{boards.length}
          <ToggleIcon size={16} aria-hidden="true" className="text-[#504f49]" />
        </button>
        {message && (
          <span
            role="status"
            className="ml-auto rounded-md bg-[#26251e] px-3 py-2 text-xs font-semibold text-[#fafafa]"
          >
            {message}
          </span>
        )}
      </div>
      {expanded && (
        <div aria-label="画板缩略图列表" className="flex gap-4 overflow-x-auto px-3 py-2">
          {boards.map((board, index) => {
            const active = board.id === activeBoardId;
            const previewText = boardPreviewText(board);
            return (
              <div key={board.id} className="group relative shrink-0">
                <button
                  type="button"
                  aria-label={`选择画板 ${index + 1}`}
                  aria-pressed={active}
                  onClick={() => onSelectBoard(board.id)}
                  className={[
                    "flex h-[72px] w-[64px] flex-col items-center justify-center overflow-hidden rounded-lg border bg-white p-1.5 text-center text-[10px] font-semibold leading-tight text-[#26251e] shadow-sm transition",
                    active
                      ? "border-[#26251e] ring-4 ring-black/10"
                      : "border-[#f3f0ef] hover:border-[#979696]/45",
                    board.selectedBackground.kind === "color"
                      ? board.selectedBackground.className
                      : "",
                  ].join(" ")}
                  style={boardPreviewStyle(board)}
                >
                  <span className="line-clamp-3 whitespace-pre-line break-words">
                    {previewText}
                  </span>
                  <span className="absolute bottom-1 left-1 inline-flex h-4 min-w-4 items-center justify-center rounded bg-[#26251e]/70 px-1 text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                </button>
                {boards.length > 1 && (
                  <button
                    type="button"
                    aria-label={`删除画板 ${index + 1}`}
                    title="删除画板"
                    onClick={() => onDeleteBoard(board.id)}
                    className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#f3f0ef] bg-white text-[#979696] opacity-0 shadow-sm transition hover:border-[#fca5a5] hover:text-[#dc2626] group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            aria-label="新增画板"
            onClick={onAddBoard}
            className="flex h-[72px] w-[64px] shrink-0 items-center justify-center rounded-lg border border-[#f3f0ef] bg-[#f6f1ea] text-[#26251e] transition hover:border-[#979696]/45 hover:bg-white"
          >
            <Plus size={24} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
