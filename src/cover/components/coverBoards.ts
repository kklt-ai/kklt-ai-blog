import type { CoverChannelId, CoverLayer } from "@/cover/lib/cover";
import type { CoverBackgroundSelection } from "./coverEditorTypes";

export const COVER_BOARDS_STORAGE_KEY = "xhs-cover-boards";
export const MAX_COVER_BOARDS = 10;
export const COVER_BOARD_LIMIT_MESSAGE = "最多保留 10 个画板，请删除旧画板后再新增。";

export type CoverBoard = {
  id: string;
  channelId: CoverChannelId;
  templateId: string;
  selectedBackground: CoverBackgroundSelection;
  layers: CoverLayer[];
};

export type CoverBoardState = {
  boards: CoverBoard[];
  activeBoardId: string;
};

let nextBoardId = 1;

function createBoardId() {
  nextBoardId += 1;
  return `cover-board-${Date.now().toString(36)}-${nextBoardId}`;
}

export function cloneCoverLayers(layers: CoverLayer[]) {
  return layers.map((layer) => ({ ...layer })) as CoverLayer[];
}

export function cloneCoverBackground(background: CoverBackgroundSelection) {
  return { ...background } as CoverBackgroundSelection;
}

export function createCoverBoard({
  id,
  channelId,
  templateId,
  selectedBackground,
  layers,
}: Omit<CoverBoard, "id"> & { id?: string }): CoverBoard {
  return {
    id: id ?? createBoardId(),
    channelId,
    templateId,
    selectedBackground: cloneCoverBackground(selectedBackground),
    layers: cloneCoverLayers(layers),
  };
}

function isCoverBoard(value: unknown): value is CoverBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as Partial<CoverBoard>;
  return (
    typeof board.id === "string" &&
    (board.channelId === "xiaohongshu" || board.channelId === "wechat") &&
    typeof board.templateId === "string" &&
    Boolean(board.selectedBackground) &&
    Array.isArray(board.layers)
  );
}

export function loadCoverBoardState(storage: Storage): CoverBoardState | null {
  const rawValue = storage.getItem(COVER_BOARDS_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<CoverBoardState>;
    const boards = Array.isArray(parsed.boards) ? parsed.boards.filter(isCoverBoard) : [];
    if (boards.length === 0) return null;
    const activeBoardId =
      typeof parsed.activeBoardId === "string" &&
      boards.some((board) => board.id === parsed.activeBoardId)
        ? parsed.activeBoardId
        : boards[0].id;
    return {
      boards: boards.slice(0, MAX_COVER_BOARDS),
      activeBoardId,
    };
  } catch {
    return null;
  }
}

export function saveCoverBoardState(storage: Storage, state: CoverBoardState) {
  storage.setItem(COVER_BOARDS_STORAGE_KEY, JSON.stringify(state));
}
