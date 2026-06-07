import { Pencil } from "lucide-react";
import {
  type FocusEvent as ReactFocusEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CoverTextHighlightEffect } from "@/cover/lib/cover";
import {
  TEXT_HIGHLIGHT_OPTIONS,
  type TextHighlightOption,
  findTextHighlight,
} from "./textHighlightOptions";

type TextHighlightPickerProps = {
  activeEffect: CoverTextHighlightEffect;
  onEffectChange: (effectId: CoverTextHighlightEffect) => void;
};

function HighlightPreview({
  effect,
  active,
  onSelect,
}: {
  effect: TextHighlightOption;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${effect.label}划重点样式`}
      aria-pressed={active}
      onClick={onSelect}
      className={[
        "flex aspect-square min-h-[82px] items-center justify-center rounded-2xl bg-zinc-100 p-2 transition",
        active
          ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-white"
          : "hover:bg-zinc-50 hover:ring-1 hover:ring-zinc-200",
      ].join(" ")}
    >
      <span
        className="text-3xl font-black leading-none text-zinc-900"
        style={effect.id === "none" ? effect.previewStyle : effect.style}
      >
        {effect.id === "none" ? "/" : "Abc"}
      </span>
      <span className="sr-only">{effect.label}</span>
    </button>
  );
}

export function TextHighlightPicker({
  activeEffect,
  onEffectChange,
}: TextHighlightPickerProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const activeHighlight = findTextHighlight(activeEffect);

  const chooseEffect = (effectId: CoverTextHighlightEffect) => {
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
        aria-label="划重点"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="inline-flex h-14 items-center gap-3 rounded-2xl bg-zinc-100 px-4 text-base font-black text-zinc-900 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-zinc-700 shadow-sm">
          <Pencil size={22} aria-hidden="true" strokeWidth={2.2} />
        </span>
        <span>划重点</span>
        <span className="sr-only">{activeHighlight.label}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="划重点样式"
          className="absolute right-0 z-20 mt-3 w-[330px] rounded-[28px] bg-white p-3 shadow-[0_18px_55px_rgba(15,23,42,0.2)] ring-1 ring-zinc-200"
        >
          <div
            aria-label="划重点样式列表"
            className="grid max-h-[280px] grid-cols-3 gap-3 overflow-y-auto overscroll-contain p-1 pr-2"
          >
            {TEXT_HIGHLIGHT_OPTIONS.map((effect) => (
              <HighlightPreview
                key={effect.id}
                effect={effect}
                active={activeEffect === effect.id}
                onSelect={() => chooseEffect(effect.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
