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
        "flex aspect-square min-h-[82px] items-center justify-center rounded-lg border bg-[#fff8e0] p-2 transition",
        active
          ? "border-[#fa520f] bg-white ring-2 ring-[#fa520f]/25"
          : "border-[#ededed] hover:border-[#e6d5a8] hover:bg-white",
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
        className="inline-flex h-12 items-center gap-3 rounded-md border border-[#e6d5a8] bg-[#fff8e0] px-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#fa520f]/20"
      >
        <span className="grid h-8 w-8 place-items-center rounded-md bg-white text-[#6a6a6a] shadow-sm">
          <Pencil size={22} aria-hidden="true" strokeWidth={2.2} />
        </span>
        <span>划重点</span>
        <span className="sr-only">{activeHighlight.label}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="划重点样式"
          className="absolute right-0 z-20 mt-3 w-[330px] rounded-xl border border-[#e6d5a8] bg-white p-3 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)]"
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
