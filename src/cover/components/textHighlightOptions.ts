import type { CSSProperties } from "react";
import type { CoverTextHighlightEffect } from "@/cover/lib/cover";

export type TextHighlightOption = {
  id: CoverTextHighlightEffect;
  label: string;
  style: CSSProperties;
  previewStyle?: CSSProperties;
};

export const NO_TEXT_HIGHLIGHT: TextHighlightOption = {
  id: "none",
  label: "无",
  style: {},
  previewStyle: { color: "#737373" },
};

export const TEXT_HIGHLIGHT_OPTIONS: TextHighlightOption[] = [
  NO_TEXT_HIGHLIGHT,
  {
    id: "highlight-ring-yellow",
    label: "黄色圈画",
    style: {
      border: "0.08em solid #facc15",
      borderRadius: "999px",
      padding: "0 0.12em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-ring-pink",
    label: "粉色圈画",
    style: {
      border: "0.08em solid #f472e6",
      borderRadius: "999px",
      padding: "0 0.12em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-diamond-red",
    label: "红色爆点",
    style: {
      background:
        "linear-gradient(135deg,transparent 0 11%,#ff4d55 11% 26%,transparent 26% 37%,#ff4d55 37% 63%,transparent 63% 74%,#ff4d55 74% 89%,transparent 89%)",
      padding: "0 0.14em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-marker-yellow",
    label: "黄色马克笔",
    style: {
      backgroundColor: "#fef08a",
      padding: "0 0.08em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-pill-cyan",
    label: "蓝色胶囊",
    style: {
      backgroundColor: "#a5e7f7",
      borderRadius: "999px",
      padding: "0 0.16em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-bubble-pink",
    label: "粉色泡泡",
    style: {
      background:
        "radial-gradient(circle at 18% 54%,#f58cff 0 28%,transparent 29%),radial-gradient(circle at 50% 50%,#f58cff 0 31%,transparent 32%),radial-gradient(circle at 82% 54%,#f58cff 0 28%,transparent 29%)",
      padding: "0 0.16em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-bubble-blue",
    label: "蓝色泡泡",
    style: {
      background:
        "radial-gradient(circle at 18% 54%,#9ee7fb 0 28%,transparent 29%),radial-gradient(circle at 50% 50%,#9ee7fb 0 31%,transparent 32%),radial-gradient(circle at 82% 54%,#9ee7fb 0 28%,transparent 29%)",
      padding: "0 0.16em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-block-green",
    label: "绿色托底",
    style: {
      backgroundImage: "linear-gradient(transparent 56%,#86efac 56%)",
      borderRadius: "0.08em",
      padding: "0 0.08em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-bottom-yellow",
    label: "黄色底线",
    style: {
      backgroundImage: "linear-gradient(transparent 72%,#fde047 72%)",
      padding: "0 0.08em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-bottom-pill",
    label: "圆角底线",
    style: {
      backgroundImage: "linear-gradient(transparent 72%,#facc15 72%)",
      borderRadius: "999px",
      padding: "0 0.14em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
  {
    id: "highlight-strike-orange",
    label: "橙色横线",
    style: {
      backgroundImage: "linear-gradient(transparent 48%,#f97316 48% 62%,transparent 62%)",
      padding: "0 0.08em",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    },
  },
];

export function findTextHighlight(effectId: CoverTextHighlightEffect) {
  return TEXT_HIGHLIGHT_OPTIONS.find((effect) => effect.id === effectId) ?? NO_TEXT_HIGHLIGHT;
}
