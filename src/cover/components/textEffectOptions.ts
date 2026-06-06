import type { CSSProperties } from "react";
import type { CoverTextEffect } from "@/cover/lib/cover";

export type TextEffectCategoryId =
  | "outline"
  | "shadow"
  | "texture"
  | "gradient"
  | "glow"
  | "three-d";

export type TextEffectOption = {
  id: CoverTextEffect;
  label: string;
  style: CSSProperties;
};

export const NO_TEXT_EFFECT: TextEffectOption = {
  id: "none",
  label: "无",
  style: { color: "#737373" },
};

export const TEXT_EFFECT_GROUPS: Array<{
  id: TextEffectCategoryId;
  label: string;
  effects: TextEffectOption[];
}> = [
  {
    id: "outline",
    label: "描边",
    effects: [
      NO_TEXT_EFFECT,
      {
        id: "outline",
        label: "描边",
        style: {
          color: "#ffffff",
          textShadow:
            "3px 0 0 #111111, -3px 0 0 #111111, 0 3px 0 #111111, 0 -3px 0 #111111, 2px 2px 0 #111111, -2px -2px 0 #111111",
        },
      },
      {
        id: "outline-white",
        label: "白边橙字",
        style: {
          color: "#ff4b1f",
          textShadow:
            "3px 0 0 #ffffff, -3px 0 0 #ffffff, 0 3px 0 #ffffff, 0 -3px 0 #ffffff, 0 8px 12px rgba(0,0,0,0.18)",
        },
      },
      {
        id: "outline-warm",
        label: "黄黑描边",
        style: {
          color: "#facc15",
          textShadow:
            "3px 0 0 #111111, -3px 0 0 #111111, 0 3px 0 #111111, 0 -3px 0 #111111",
        },
      },
      {
        id: "outline-red",
        label: "红色描边",
        style: {
          color: "#fff7ed",
          textShadow:
            "3px 0 0 #c02626, -3px 0 0 #c02626, 0 3px 0 #c02626, 0 -3px 0 #c02626",
        },
      },
      {
        id: "outline-blue",
        label: "蓝白描边",
        style: {
          color: "#ffffff",
          textShadow:
            "3px 0 0 #2563eb, -3px 0 0 #2563eb, 0 3px 0 #2563eb, 0 -3px 0 #2563eb",
        },
      },
      {
        id: "outline-lime",
        label: "荧光描边",
        style: {
          color: "#a3e635",
          textShadow:
            "3px 0 0 #111111, -3px 0 0 #111111, 0 3px 0 #111111, 0 -3px 0 #111111",
        },
      },
    ],
  },
  {
    id: "shadow",
    label: "投影",
    effects: [
      NO_TEXT_EFFECT,
      { id: "shadow", label: "硬投影", style: { color: "#111111", textShadow: "8px 8px 0 rgba(0,0,0,0.16)" } },
      {
        id: "shadow-speed",
        label: "速度投影",
        style: {
          color: "#111111",
          textShadow: "10px 0 0 rgba(0,0,0,0.16), 18px 0 0 rgba(0,0,0,0.08)",
        },
      },
      { id: "shadow-soft", label: "柔投影", style: { color: "#111111", textShadow: "0 12px 16px rgba(0,0,0,0.28)" } },
      { id: "shadow-yellow", label: "黄底投影", style: { color: "#facc15", textShadow: "5px 5px 0 #111111" } },
      {
        id: "shadow-scan",
        label: "线稿投影",
        style: {
          color: "#ffffff",
          textShadow:
            "2px 0 0 #111111, -2px 0 0 #111111, 0 2px 0 #111111, 0 -2px 0 #111111, 8px 8px 0 rgba(0,0,0,0.18)",
        },
      },
      { id: "shadow-poster", label: "海报投影", style: { color: "#ff3d00", textShadow: "5px 5px 0 #111111, 10px 10px 0 #facc15" } },
    ],
  },
  {
    id: "texture",
    label: "纹理",
    effects: [
      NO_TEXT_EFFECT,
      {
        id: "texture-ice",
        label: "冰蓝纹理",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(180deg,#eff6ff 0%,#38bdf8 54%,#0f172a 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 3px 0 rgba(14,116,144,0.5)",
        },
      },
      {
        id: "texture-gold",
        label: "金属纹理",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(180deg,#fff7cc 0%,#d4a849 45%,#8a5b12 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 2px 0 rgba(17,17,17,0.35)",
        },
      },
      {
        id: "texture-blue",
        label: "蓝色纹理",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(180deg,#60a5fa 0%,#2563eb 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
      },
      {
        id: "texture-stripe",
        label: "条纹纹理",
        style: {
          color: "transparent",
          backgroundImage:
            "repeating-linear-gradient(180deg,#111111 0 7px,#ffffff 7px 11px)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "2px 2px 0 #f97316",
        },
      },
      {
        id: "texture-copper",
        label: "铜版纹理",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(180deg,#fed7aa 0%,#c2410c 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
      },
      {
        id: "texture-comic",
        label: "漫画纹理",
        style: {
          color: "#facc15",
          textShadow:
            "3px 0 0 #111111, -3px 0 0 #111111, 0 3px 0 #111111, 0 -3px 0 #111111, 4px 4px 0 #ffffff",
        },
      },
    ],
  },
  {
    id: "gradient",
    label: "渐变",
    effects: [
      NO_TEXT_EFFECT,
      {
        id: "gradient-silver",
        label: "银灰渐变",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(180deg,#3f3f46 0%,#a1a1aa 58%,#f4f4f5 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
      },
      {
        id: "gradient-red-black",
        label: "红黑渐变",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(90deg,#ff2d16 0%,#ff2d16 48%,#111111 48%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
      },
      {
        id: "gradient-outline",
        label: "描边渐变",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(180deg,#ffffff 0%,#fed7aa 55%,#fb923c 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow:
            "2px 0 0 #111111, -2px 0 0 #111111, 0 2px 0 #111111, 0 -2px 0 #111111",
        },
      },
      {
        id: "gradient",
        label: "蓝紫渐变",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(135deg,#2563eb 0%,#7c3aed 52%,#ec4899 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "3px 3px 0 rgba(17,17,17,0.2)",
        },
      },
      {
        id: "gradient-peach",
        label: "蜜桃渐变",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(180deg,#fed7aa 0%,#e879f9 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
      },
      {
        id: "gradient-sun",
        label: "太阳渐变",
        style: {
          color: "transparent",
          backgroundImage: "linear-gradient(180deg,#fef08a 0%,#facc15 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow:
            "2px 0 0 #111111, -2px 0 0 #111111, 0 2px 0 #111111, 0 -2px 0 #111111",
        },
      },
    ],
  },
  {
    id: "glow",
    label: "发光",
    effects: [
      NO_TEXT_EFFECT,
      {
        id: "glow",
        label: "蓝色发光",
        style: {
          color: "#60a5fa",
          textShadow:
            "0 0 8px rgba(96,165,250,0.9), 0 0 18px rgba(96,165,250,0.6)",
        },
      },
      {
        id: "glow-red",
        label: "红黑发光",
        style: {
          color: "#ff2d16",
          textShadow: "0 0 12px rgba(239,68,68,0.7), 4px 4px 0 #111111",
        },
      },
      {
        id: "glow-outline",
        label: "线框发光",
        style: {
          color: "#ffffff",
          textShadow:
            "2px 0 0 #111111, -2px 0 0 #111111, 0 2px 0 #111111, 0 -2px 0 #111111, 0 0 18px rgba(251,146,60,0.82)",
        },
      },
      {
        id: "glow-indigo",
        label: "霓虹蓝紫",
        style: {
          color: "#4f46e5",
          textShadow: "0 0 12px rgba(79,70,229,0.9), 0 0 24px rgba(236,72,153,0.45)",
        },
      },
      { id: "glow-lime", label: "霓虹绿", style: { color: "#a3e635", textShadow: "0 0 12px rgba(163,230,53,0.85), 3px 3px 0 #111111" } },
      { id: "glow-pink", label: "粉色发光", style: { color: "#fb4c96", textShadow: "0 0 12px rgba(251,76,150,0.9), 0 0 24px rgba(251,113,133,0.55)" } },
    ],
  },
  {
    id: "three-d",
    label: "3D",
    effects: [
      NO_TEXT_EFFECT,
      { id: "three-d-blue", label: "蓝黄立体", style: { color: "#facc15", textShadow: "3px 0 0 #1d4ed8, -3px 0 0 #1d4ed8, 0 3px 0 #1d4ed8, 0 -3px 0 #1d4ed8, 6px 6px 0 #1d4ed8" } },
      { id: "three-d-violet", label: "紫蓝立体", style: { color: "#67e8f9", textShadow: "3px 0 0 #7c3aed, -3px 0 0 #7c3aed, 0 3px 0 #7c3aed, 0 -3px 0 #7c3aed, 6px 6px 0 #7c3aed" } },
      { id: "three-d-cyan", label: "青黑立体", style: { color: "#22d3ee", textShadow: "3px 0 0 #111111, -3px 0 0 #111111, 0 3px 0 #111111, 0 -3px 0 #111111, 6px 6px 0 #111111" } },
      { id: "three-d-orange", label: "橙色立体", style: { color: "#f97316", textShadow: "3px 0 0 #111111, -3px 0 0 #111111, 0 3px 0 #111111, 0 -3px 0 #111111, 6px 6px 0 #facc15" } },
      {
        id: "three-d-wire",
        label: "线框立体",
        style: {
          color: "#ffffff",
          textShadow:
            "2px 0 0 #111111, -2px 0 0 #111111, 0 2px 0 #111111, 0 -2px 0 #111111, 6px 6px 0 rgba(0,0,0,0.18)",
        },
      },
      { id: "three-d-yellow", label: "黄色立体", style: { color: "#fde047", textShadow: "3px 0 0 #111111, -3px 0 0 #111111, 0 3px 0 #111111, 0 -3px 0 #111111, 6px 6px 0 #f97316" } },
    ],
  },
];

const TEXT_EFFECTS = TEXT_EFFECT_GROUPS.flatMap((group) => group.effects);

export function findTextEffect(effectId: CoverTextEffect) {
  return TEXT_EFFECTS.find((effect) => effect.id === effectId) ?? NO_TEXT_EFFECT;
}
