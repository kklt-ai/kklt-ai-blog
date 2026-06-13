import { useState } from "react";
import { ChevronDown, ChevronUp, Layers, Plus, Trash2 } from "lucide-react";
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
    return {
      backgroundImage: `url(${board.selectedBackground.src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
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
      className="overflow-hidden rounded-lg border border-[#e6d5a8] bg-white/95 shadow-[0_8px_24px_rgba(31,31,31,0.08)]"
    >
      <div className="flex items-center gap-2 border-b border-[#ededed] p-2">
        <button
          type="button"
          aria-label={expanded ? "收起画板列表" : "展开画板列表"}
          aria-expanded={expanded}
          title={expanded ? "收起画板列表" : "展开画板列表"}
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#ededed] bg-white text-[#1f1f1f] shadow-sm transition hover:border-[#d7d7d7] hover:bg-[#f6f7f9]"
        >
          <Layers size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`画板 ${activeIndex + 1}/${boards.length}`}
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#ededed] bg-white px-3 text-sm font-semibold text-[#1f1f1f] shadow-sm transition hover:border-[#d7d7d7] hover:bg-[#f6f7f9]"
        >
          画板 {activeIndex + 1}/{boards.length}
          <ToggleIcon size={16} aria-hidden="true" className="text-[#8a8a8a]" />
        </button>
        {message && (
          <span
            role="status"
            className="ml-auto rounded-md bg-[#1f1f1f] px-3 py-2 text-xs font-semibold text-white"
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
                    "flex h-[72px] w-[64px] flex-col items-center justify-center overflow-hidden rounded-lg border bg-white p-1.5 text-center text-[10px] font-semibold leading-tight text-[#1f1f1f] shadow-sm transition",
                    active
                      ? "border-[#5f8cff] ring-4 ring-[#5f8cff]/25"
                      : "border-[#ededed] hover:border-[#e6d5a8]",
                    board.selectedBackground.kind === "color"
                      ? board.selectedBackground.className
                      : "",
                  ].join(" ")}
                  style={boardPreviewStyle(board)}
                >
                  <span className="line-clamp-3 whitespace-pre-line break-words">
                    {previewText}
                  </span>
                  <span className="absolute bottom-1 left-1 inline-flex h-4 min-w-4 items-center justify-center rounded bg-[#1f1f1f]/70 px-1 text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                </button>
                {boards.length > 1 && (
                  <button
                    type="button"
                    aria-label={`删除画板 ${index + 1}`}
                    title="删除画板"
                    onClick={() => onDeleteBoard(board.id)}
                    className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#ededed] bg-white text-[#8a8a8a] opacity-0 shadow-sm transition hover:border-[#fca5a5] hover:text-[#dc2626] group-hover:opacity-100 group-focus-within:opacity-100"
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
            className="flex h-[72px] w-[64px] shrink-0 items-center justify-center rounded-lg border border-[#ededed] bg-[#f6f7f9] text-[#1f1f1f] transition hover:border-[#c7c7c7] hover:bg-white"
          >
            <Plus size={24} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
