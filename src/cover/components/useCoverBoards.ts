import { useEffect, useRef, useState } from "react";
import {
  type CoverChannelId,
  type CoverBackgroundImage,
  type CoverLayer,
  type CoverTemplate,
  cloneTemplateLayers,
} from "@/cover/lib/cover";
import {
  COVER_BOARD_LIMIT_MESSAGE,
  MAX_COVER_BOARDS,
  type CoverBoard,
  type CoverBoardState,
  cloneCoverBackground,
  cloneCoverLayers,
  createCoverBoard,
  loadCoverBoardState,
  saveCoverBoardState,
} from "./coverBoards";
import type { CoverBackgroundSelection } from "./coverEditorTypes";

type UseCoverBoardsOptions = {
  initialBoardState: CoverBoardState | null;
  defaultBoard: CoverBoard;
  channelId: CoverChannelId;
  templateId: string;
  layers: CoverLayer[];
  selectedBackground: CoverBackgroundSelection;
  templates: CoverTemplate[];
  getTemplatesForChannel: (channelId: CoverChannelId) => CoverTemplate[];
  getBackgroundsForChannel: (channelId: CoverChannelId) => CoverBackgroundImage[];
  setChannelId: (channelId: CoverChannelId) => void;
  setTemplateId: (templateId: string) => void;
  setLayers: (layers: CoverLayer[]) => void;
  setSelectedLayerId: (layerId: string) => void;
  setActivePreviewLayerId: (layerId: string) => void;
  setEditingLayerId: (layerId: string | null) => void;
  setSelectedBackground: (background: CoverBackgroundSelection) => void;
  setCanvasScale: (scale: number) => void;
  defaultCanvasScale: (channelId: CoverChannelId) => number;
  backgroundSelectionForTemplate: (
    template: CoverTemplate,
    backgrounds: CoverBackgroundImage[],
  ) => CoverBackgroundSelection;
};

export function useCoverBoards({
  initialBoardState,
  defaultBoard,
  channelId,
  templateId,
  layers,
  selectedBackground,
  templates,
  getTemplatesForChannel,
  getBackgroundsForChannel,
  setChannelId,
  setTemplateId,
  setLayers,
  setSelectedLayerId,
  setActivePreviewLayerId,
  setEditingLayerId,
  setSelectedBackground,
  setCanvasScale,
  defaultCanvasScale,
  backgroundSelectionForTemplate,
}: UseCoverBoardsOptions) {
  const [boards, setBoards] = useState<CoverBoard[]>(() =>
    initialBoardState?.boards.length ? initialBoardState.boards : [defaultBoard],
  );
  const [activeBoardId, setActiveBoardId] = useState(
    initialBoardState?.activeBoardId ?? defaultBoard.id,
  );
  const [boardActionMessage, setBoardActionMessage] = useState("");
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const restoredBoardStateRef = useRef(Boolean(initialBoardState));

  const currentBoardSnapshot = (): CoverBoard => ({
    id: activeBoardId,
    channelId,
    templateId,
    selectedBackground: cloneCoverBackground(selectedBackground),
    layers: cloneCoverLayers(layers),
  });

  const boardsWithCurrentSnapshot = () => {
    const snapshot = currentBoardSnapshot();
    return boards.map((board) => (board.id === activeBoardId ? snapshot : board));
  };

  const applyBoard = (board: CoverBoard) => {
    setActiveBoardId(board.id);
    setChannelId(board.channelId);
    setTemplateId(board.templateId);
    const nextLayers = cloneCoverLayers(board.layers);
    setLayers(nextLayers);
    setSelectedLayerId(nextLayers[0]?.id ?? "");
    setActivePreviewLayerId("");
    setEditingLayerId(null);
    setSelectedBackground(cloneCoverBackground(board.selectedBackground));
    setCanvasScale(defaultCanvasScale(board.channelId));
  };

  const boardFromTemplate = (nextChannelId: CoverChannelId, nextTemplateId: string) => {
    const nextTemplate = getTemplatesForChannel(nextChannelId).find(
      (template) => template.id === nextTemplateId,
    );
    if (!nextTemplate) return null;
    return createCoverBoard({
      channelId: nextChannelId,
      templateId: nextTemplate.id,
      selectedBackground: backgroundSelectionForTemplate(
        nextTemplate,
        getBackgroundsForChannel(nextChannelId),
      ),
      layers: cloneTemplateLayers(nextTemplate),
    });
  };

  const resetToTemplate = (nextChannelId: CoverChannelId, nextTemplateId: string) => {
    const nextBoard = boardFromTemplate(nextChannelId, nextTemplateId);
    if (!nextBoard) return;
    setTemplateId(nextBoard.templateId);
    setLayers(cloneCoverLayers(nextBoard.layers));
    setSelectedLayerId(nextBoard.layers[0]?.id ?? "");
    setActivePreviewLayerId("");
    setEditingLayerId(null);
    setSelectedBackground(cloneCoverBackground(nextBoard.selectedBackground));
  };

  const selectBoard = (boardId: string) => {
    const nextBoards = boardsWithCurrentSnapshot();
    const nextBoard = nextBoards.find((board) => board.id === boardId);
    if (!nextBoard) return;
    setBoards(nextBoards);
    applyBoard(nextBoard);
  };

  const addBoardFromCurrent = () => {
    if (boards.length >= MAX_COVER_BOARDS) {
      setBoardActionMessage(COVER_BOARD_LIMIT_MESSAGE);
      return false;
    }
    const nextBoard = createCoverBoard({
      channelId,
      templateId,
      selectedBackground,
      layers,
    });
    setBoards([...boardsWithCurrentSnapshot(), nextBoard]);
    applyBoard(nextBoard);
    setBoardActionMessage("");
    return true;
  };

  const deleteBoard = (boardId: string) => {
    if (boards.length <= 1) return;
    const nextBoards = boardsWithCurrentSnapshot().filter((board) => board.id !== boardId);
    const deletedIndex = boards.findIndex((board) => board.id === boardId);
    const fallbackIndex = Math.max(0, deletedIndex - 1);
    const nextActiveBoard =
      boardId === activeBoardId
        ? nextBoards[fallbackIndex] ?? nextBoards[0]
        : nextBoards.find((board) => board.id === activeBoardId) ?? nextBoards[0];
    setBoards(nextBoards);
    if (nextActiveBoard) applyBoard(nextActiveBoard);
    setBoardActionMessage("");
  };

  const createBoardFromPendingTemplate = () => {
    if (!pendingTemplateId) return;
    if (boards.length >= MAX_COVER_BOARDS) {
      setBoardActionMessage(COVER_BOARD_LIMIT_MESSAGE);
      return;
    }
    const nextBoard = boardFromTemplate(channelId, pendingTemplateId);
    if (!nextBoard) return;
    setBoards([...boardsWithCurrentSnapshot(), nextBoard]);
    applyBoard(nextBoard);
    setPendingTemplateId(null);
    setBoardActionMessage("");
  };

  const overwriteCurrentBoardWithPendingTemplate = () => {
    if (!pendingTemplateId) return;
    resetToTemplate(channelId, pendingTemplateId);
    setPendingTemplateId(null);
    setBoardActionMessage("");
  };

  useEffect(() => {
    if (restoredBoardStateRef.current || typeof window === "undefined") return;
    restoredBoardStateRef.current = true;
    const savedBoardState = loadCoverBoardState(window.localStorage);
    if (!savedBoardState) return;
    const nextBoard =
      savedBoardState.boards.find((board) => board.id === savedBoardState.activeBoardId) ??
      savedBoardState.boards[0];
    setBoards(savedBoardState.boards);
    if (nextBoard) applyBoard(nextBoard);
  }, []);

  useEffect(() => {
    setBoards((currentBoards) =>
      currentBoards.map((board) =>
        board.id === activeBoardId
          ? {
              ...board,
              channelId,
              templateId,
              selectedBackground: cloneCoverBackground(selectedBackground),
              layers: cloneCoverLayers(layers),
            }
          : board,
      ),
    );
  }, [activeBoardId, channelId, layers, selectedBackground, templateId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    saveCoverBoardState(window.localStorage, { boards, activeBoardId });
  }, [activeBoardId, boards]);

  useEffect(() => {
    if (!boardActionMessage) return;
    const timeoutId = window.setTimeout(() => {
      setBoardActionMessage("");
    }, 2000);
    return () => window.clearTimeout(timeoutId);
  }, [boardActionMessage]);

  const pendingTemplate =
    pendingTemplateId && templates.find((template) => template.id === pendingTemplateId);

  return {
    boards,
    activeBoardId,
    boardActionMessage,
    pendingTemplate,
    chooseTemplate: setPendingTemplateId,
    cancelPendingTemplate: () => setPendingTemplateId(null),
    selectBoard,
    addBoardFromCurrent,
    deleteBoard,
    createBoardFromPendingTemplate,
    overwriteCurrentBoardWithPendingTemplate,
    resetToTemplate,
  };
}
