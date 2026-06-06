import type { CoverTextEffect } from "@/cover/lib/cover";
import {
  TEXT_EFFECT_GROUPS,
  type TextEffectCategoryId,
  type TextEffectOption,
} from "./textEffectOptions";

type TextEffectPickerProps = {
  activeCategoryId: TextEffectCategoryId;
  activeEffect: CoverTextEffect;
  onCategoryChange: (categoryId: TextEffectCategoryId) => void;
  onEffectChange: (effectId: CoverTextEffect) => void;
};

function EffectCard({
  effect,
  active,
  onSelect,
}: {
  effect: TextEffectOption;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${effect.label}文字特效`}
      aria-pressed={active}
      onClick={onSelect}
      className={[
        "relative min-h-[96px] rounded-2xl bg-zinc-100 p-2 text-center transition",
        active
          ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-white"
          : "hover:bg-zinc-50 hover:ring-1 hover:ring-zinc-200",
      ].join(" ")}
    >
      <span
        className="flex min-h-[64px] items-center justify-center text-5xl font-black leading-none"
        style={effect.style}
      >
        {effect.id === "none" ? "/" : "A"}
      </span>
      <span className="sr-only">{effect.label}</span>
    </button>
  );
}

export function TextEffectPicker({
  activeCategoryId,
  activeEffect,
  onCategoryChange,
  onEffectChange,
}: TextEffectPickerProps) {
  const activeGroup =
    TEXT_EFFECT_GROUPS.find((group) => group.id === activeCategoryId) ??
    TEXT_EFFECT_GROUPS[0];

  return (
    <section aria-label="文字特效" className="rounded-2xl border border-zinc-100 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h4 className="text-base font-black">文字特效</h4>
        <span className="text-xs font-semibold text-zinc-400">A</span>
      </div>
      <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-3 p-3">
        <div role="group" aria-label="文字特效分类" className="flex flex-col gap-2">
          {TEXT_EFFECT_GROUPS.map((group) => {
            const active = activeGroup.id === group.id;
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={active}
                onClick={() => onCategoryChange(group.id)}
                className={[
                  "min-h-11 rounded-xl px-3 text-left text-base font-black transition",
                  active
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
                ].join(" ")}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        <div className="grid max-h-[430px] grid-cols-3 gap-3 overflow-y-auto pr-1">
          {activeGroup.effects.map((effect) => (
            <EffectCard
              key={`${activeGroup.id}-${effect.id}`}
              effect={effect}
              active={activeEffect === effect.id}
              onSelect={() => onEffectChange(effect.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
