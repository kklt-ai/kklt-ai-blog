import { Trash2 } from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
} from "react";
import {
  type CoverIconLayer,
  type CoverLayer,
  type CoverTextLayer,
  findBrandIcon,
  fontFamilyCss,
} from "@/cover/lib/cover";
import { findTextHighlight } from "./textHighlightOptions";
import { findTextEffect } from "./textEffectOptions";

function layerKey(layer: CoverLayer) {
  return `${layer.type}-${layer.id}`;
}

function textEffectStyle(layer: CoverTextLayer): CSSProperties {
  if (!layer.textEffect || layer.textEffect === "none") return {};
  return findTextEffect(layer.textEffect).style;
}

function textHighlightStyle(layer: CoverTextLayer): CSSProperties {
  if (!layer.highlightEffect || layer.highlightEffect === "none") return {};
  return findTextHighlight(layer.highlightEffect).style;
}

function LayerDeleteButton({
  label,
  selected,
  onDelete,
}: {
  label: string;
  selected: boolean;
  onDelete?: () => void;
}) {
  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <button
      type="button"
      aria-label={label}
      data-cover-layer="true"
      onClick={handleClick}
      onPointerDown={(event) => event.stopPropagation()}
      className={[
        "absolute -right-3 -top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-950 bg-white text-rose-600 shadow-[2px_2px_0_#18181b] transition hover:bg-rose-100",
        selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
      ].join(" ")}
    >
      <Trash2 size={17} aria-hidden="true" />
    </button>
  );
}

function TextLayerView({
  layer,
  selected,
  editing,
  onSelect,
  onDragStart,
  onEditStart,
  onTextChange,
  onFinishEditing,
  onDelete,
  interactive = true,
}: {
  layer: CoverTextLayer;
  selected: boolean;
  editing?: boolean;
  onSelect?: () => void;
  onDragStart?: (event: ReactPointerEvent<HTMLButtonElement>, layer: CoverLayer) => void;
  onEditStart?: () => void;
  onTextChange?: (text: string) => void;
  onFinishEditing?: () => void;
  onDelete?: () => void;
  interactive?: boolean;
}) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const className = [
    "touch-none whitespace-pre-line rounded-2xl border-2 px-3 py-2 text-inherit",
    interactive ? "transition" : "",
    editing && interactive
      ? "border-sky-400 bg-white/20 outline-none ring-4 ring-sky-300/30"
      : selected && interactive
        ? "border-sky-400 bg-white/15 shadow-[0_0_0_4px_rgba(56,189,248,0.24)]"
        : interactive
          ? "border-transparent hover:border-white/70"
          : "border-transparent",
  ].join(" ");
  const positionStyle: CSSProperties = {
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    width: `${layer.width}%`,
  };
  const textStyle: CSSProperties = {
    color: layer.color,
    fontSize: `${layer.fontSize}px`,
    fontFamily: fontFamilyCss(layer.fontFamily),
    fontWeight: layer.bold ? 900 : 500,
    fontStyle: layer.italic ? "italic" : "normal",
    textDecoration: layer.underline ? "underline" : "none",
    textAlign: layer.align,
    lineHeight: layer.lineHeight,
    letterSpacing: layer.letterSpacing ? `${layer.letterSpacing}px` : undefined,
    ...textEffectStyle(layer),
  };
  const hasHighlight = Boolean(layer.highlightEffect && layer.highlightEffect !== "none");
  const highlightStyle = hasHighlight ? textHighlightStyle(layer) : undefined;
  const textContent = highlightStyle ? (
    <span className="inline leading-none" style={highlightStyle}>
      {layer.text}
    </span>
  ) : (
    layer.text
  );

  useEffect(() => {
    if (!editing) return;
    editorRef.current?.focus();
    editorRef.current?.select();
  }, [editing]);

  if (!interactive) {
    return (
      <div className={`absolute ${className}`} style={{ ...positionStyle, ...textStyle }}>
        {textContent}
      </div>
    );
  }

  if (editing) {
    return (
      <textarea
        ref={editorRef}
        aria-label={`${layer.text.replace(/\s+/g, " ")} 文字编辑框`}
        value={layer.text}
        onChange={(event) => onTextChange?.(event.target.value)}
        onBlur={onFinishEditing}
        onPointerDown={(event) => event.stopPropagation()}
        data-cover-text-editor="true"
        data-cover-layer="true"
        className={`absolute ${className} resize-none`}
        style={{ ...positionStyle, ...textStyle }}
      />
    );
  }

  return (
    <div className="group absolute" style={positionStyle}>
      <button
        type="button"
        aria-label={`${layer.text.replace(/\s+/g, " ")} 文字图层`}
        data-cover-layer="true"
        onClick={onSelect}
        onDoubleClick={onEditStart}
        onPointerDown={(event) => onDragStart?.(event, layer)}
        className={`${className} h-full w-full`}
        style={textStyle}
      >
        {textContent}
      </button>
      <LayerDeleteButton
        label={`删除 ${layer.text.replace(/\s+/g, " ")} 图层`}
        selected={selected}
        onDelete={onDelete}
      />
    </div>
  );
}

function IconLayerView({
  layer,
  selected,
  onSelect,
  onDragStart,
  onDelete,
  interactive = true,
}: {
  layer: CoverIconLayer;
  selected: boolean;
  onSelect?: () => void;
  onDragStart?: (event: ReactPointerEvent<HTMLButtonElement>, layer: CoverLayer) => void;
  onDelete?: () => void;
  interactive?: boolean;
}) {
  const icon = findBrandIcon(layer.iconId);
  const className = [
    "flex h-full w-full touch-none items-center justify-center rounded-[28%] border-2 font-black shadow-xl",
    interactive ? "transition" : "",
    icon.className,
    selected && interactive
      ? "border-sky-300 ring-4 ring-sky-300/35"
      : interactive
        ? "border-white/70 hover:ring-4 hover:ring-white/30"
        : "border-white/70",
  ].join(" ");
  const style: CSSProperties = {
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    width: `${layer.size}%`,
    aspectRatio: "1 / 1",
    fontSize: `${Math.max(13, layer.size * 2.4)}px`,
  };
  const content = icon.src ? (
    <img
      src={icon.src}
      alt={`${icon.name} logo`}
      className="h-[72%] w-[72%] object-contain"
      draggable={false}
    />
  ) : (
    icon.mark
  );

  if (!interactive) {
    return (
      <div className={`absolute ${className}`} style={style}>
        {content}
      </div>
    );
  }

  return (
    <div className="group absolute" style={style}>
      <button
        type="button"
        aria-label={`${icon.name} 图标图层`}
        data-cover-layer="true"
        onClick={onSelect}
        onPointerDown={(event) => onDragStart?.(event, layer)}
        className={className}
      >
        {content}
      </button>
      <LayerDeleteButton
        label={`删除 ${icon.name} 图层`}
        selected={selected}
        onDelete={onDelete}
      />
    </div>
  );
}

export function CoverCanvasContent({
  layers,
  selectedLayerId,
  editingLayerId,
  showBackgroundDecorations = true,
  onSelectLayer,
  onDragStart,
  onEditTextLayer,
  onTextLayerChange,
  onFinishEditing,
  onDeleteLayer,
  interactive = true,
}: {
  layers: CoverLayer[];
  selectedLayerId?: string;
  editingLayerId?: string;
  showBackgroundDecorations?: boolean;
  onSelectLayer?: (layerId: string) => void;
  onDragStart?: (event: ReactPointerEvent<HTMLButtonElement>, layer: CoverLayer) => void;
  onEditTextLayer?: (layerId: string) => void;
  onTextLayerChange?: (layerId: string, text: string) => void;
  onFinishEditing?: () => void;
  onDeleteLayer?: (layerId: string) => void;
  interactive?: boolean;
}) {
  return (
    <>
      {showBackgroundDecorations && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.45)_0_8%,transparent_9%),radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.36)_0_10%,transparent_11%)]" />
      )}
      {layers.map((layer) =>
        layer.type === "text" ? (
          <TextLayerView
            key={layerKey(layer)}
            layer={layer}
            selected={layer.id === selectedLayerId}
            editing={layer.id === editingLayerId}
            onSelect={() => onSelectLayer?.(layer.id)}
            onDragStart={onDragStart}
            onEditStart={() => onEditTextLayer?.(layer.id)}
            onTextChange={(text) => onTextLayerChange?.(layer.id, text)}
            onFinishEditing={onFinishEditing}
            onDelete={() => onDeleteLayer?.(layer.id)}
            interactive={interactive}
          />
        ) : (
          <IconLayerView
            key={layerKey(layer)}
            layer={layer}
            selected={layer.id === selectedLayerId}
            onSelect={() => onSelectLayer?.(layer.id)}
            onDragStart={onDragStart}
            onDelete={() => onDeleteLayer?.(layer.id)}
            interactive={interactive}
          />
        ),
      )}
    </>
  );
}
