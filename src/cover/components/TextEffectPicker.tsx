import { Sparkles } from "lucide-react";
import {
  type FocusEvent as ReactFocusEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CoverTextEffect } from "@/cover/lib/cover";
import {
  TEXT_EFFECT_GROUPS,
  type TextEffectCategoryId,
  type TextEffectOption,
  findTextEffect,
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
        "relative min-h-[96px] rounded-lg border bg-[#fff8e0] p-2 text-center transition",
        active
          ? "border-[#fa520f] bg-white ring-2 ring-[#fa520f]/25"
          : "border-[#ededed] hover:border-[#e6d5a8] hover:bg-white",
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
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const activeGroup =
    TEXT_EFFECT_GROUPS.find((group) => group.id === activeCategoryId) ??
    TEXT_EFFECT_GROUPS[0];
  const activeTextEffect = findTextEffect(activeEffect);

  const chooseEffect = (effectId: CoverTextEffect) => {
    onEffectChange(effectId);
    setOpen(false);
  };

  const closeIfFocusLeavesPicker = (event: ReactFocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeIfPointerStartsOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (pickerRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", closeIfPointerStartsOutside);
    return () => document.removeEventListener("pointerdown", closeIfPointerStartsOutside);
  }, [open]);

  return (
    <div ref={pickerRef} className="relative" onBlur={closeIfFocusLeavesPicker}>
      <button
        type="button"
        aria-label="文字特效"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="inline-flex h-12 items-center gap-3 rounded-md border border-[#e6d5a8] bg-[#fff8e0] px-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#fa520f]/20"
      >
        <span className="grid h-8 w-8 place-items-center rounded-md bg-white text-[#6a6a6a] shadow-sm">
          <Sparkles size={22} aria-hidden="true" strokeWidth={2.2} />
        </span>
        <span>文字特效</span>
        <span className="sr-only">{activeTextEffect.label}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="文字特效样式"
          className="absolute right-0 z-20 mt-3 w-[360px] rounded-xl border border-[#e6d5a8] bg-white p-3 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)]"
        >
          <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-3">
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
                      "min-h-11 rounded-md px-3 text-left text-sm font-semibold transition",
                      active
                        ? "bg-[#fff8e0] text-[#1f1f1f]"
                        : "text-[#6a6a6a] hover:bg-[#fffaeb] hover:text-[#1f1f1f]",
                    ].join(" ")}
                  >
                    {group.label}
                  </button>
                );
              })}
            </div>

            <div
              aria-label="文字特效样式列表"
              className="grid max-h-[280px] grid-cols-3 gap-3 overflow-y-auto overscroll-contain p-1 pr-2"
            >
              {activeGroup.effects.map((effect) => (
                <EffectCard
                  key={`${activeGroup.id}-${effect.id}`}
                  effect={effect}
                  active={activeEffect === effect.id}
                  onSelect={() => chooseEffect(effect.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
