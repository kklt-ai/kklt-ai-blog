import { ExternalLink, Image as ImageIcon, LayoutTemplate, Paintbrush, Plus, Type } from "lucide-react";
import type { RefObject } from "react";
import {
  type BrandIcon,
  type BrandIconId,
  type CoverBackgroundImage,
  type CoverChannelId,
  type CoverTemplate,
  getChannel,
} from "@/cover/lib/cover";
import { CoverCanvasContent } from "./CoverCanvas";
import type {
  CoverBackgroundSelection,
  CoverBackgroundTabId,
  CoverToolId,
} from "./coverEditorTypes";

const COVER_TOOLS: Array<{
  id: CoverToolId;
  label: string;
  icon: typeof LayoutTemplate;
}> = [
  { id: "templates", label: "模板", icon: LayoutTemplate },
  { id: "text", label: "文字", icon: Type },
  { id: "image", label: "图片", icon: ImageIcon },
  { id: "background", label: "背景", icon: Paintbrush },
];

function backgroundPreviewAspectClassName(channelId: CoverChannelId) {
  return channelId === "wechat" ? "aspect-[1200/628]" : "aspect-[3/4]";
}

function templatePreviewScale(channelId: CoverChannelId) {
  return channelId === "wechat" ? 0.19 : 0.15;
}

type CoverToolPanelProps = {
  activeToolId: CoverToolId;
  onActiveToolChange: (toolId: CoverToolId) => void;
  templates: CoverTemplate[];
  customTemplates: CoverTemplate[];
  activeTemplate: CoverTemplate;
  onChooseTemplate: (templateId: string) => void;
  onAddTextLayer: () => void;
  logoSearchInputRef: RefObject<HTMLInputElement>;
  logoSearchQuery: string;
  onLogoSearchQueryChange: (query: string) => void;
  filteredBrandIcons: BrandIcon[];
  onAddIconLayer: (iconId: BrandIconId) => void;
  channelId: CoverChannelId;
  backgroundTabId: CoverBackgroundTabId;
  onBackgroundTabChange: (tabId: CoverBackgroundTabId) => void;
  backgroundImages: CoverBackgroundImage[];
  selectedBackground: CoverBackgroundSelection;
  onSelectedBackgroundChange: (background: CoverBackgroundSelection) => void;
};

function TemplateThumbnail({
  template,
  imageBackground,
}: {
  template: CoverTemplate;
  imageBackground?: CoverBackgroundImage;
}) {
  const channel = getChannel(template.channel);
  const previewScale = templatePreviewScale(template.channel);
  const backgroundStyle = imageBackground
    ? {
        backgroundImage: `url("${imageBackground.src}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <span
      role="img"
      aria-label={`${template.name}模板预览`}
      className="mb-3 block overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm"
      style={{
        width: `${channel.width * previewScale}px`,
        maxWidth: "100%",
        aspectRatio: `${channel.width} / ${channel.height}`,
      }}
    >
      <span
        className={["relative block overflow-hidden", template.backgroundClassName].join(" ")}
        style={{
          width: `${channel.width}px`,
          height: `${channel.height}px`,
          transform: `scale(${previewScale})`,
          transformOrigin: "left top",
          ...backgroundStyle,
        }}
      >
        <CoverCanvasContent
          layers={template.layers}
          interactive={false}
          showBackgroundDecorations={!imageBackground}
        />
      </span>
    </span>
  );
}

function ToolNavigation({
  activeToolId,
  onActiveToolChange,
}: Pick<CoverToolPanelProps, "activeToolId" | "onActiveToolChange">) {
  return (
    <nav
      aria-label="封面功能栏"
      className="flex w-[88px] shrink-0 flex-col gap-2 border-r border-zinc-200 px-3 py-5 max-sm:w-full max-sm:flex-row max-sm:border-b max-sm:border-r-0"
    >
      {COVER_TOOLS.map((tool) => {
        const Icon = tool.icon;
        const active = tool.id === activeToolId;
        return (
          <button
            key={tool.id}
            type="button"
            aria-pressed={active}
            onClick={() => onActiveToolChange(tool.id)}
            className={[
              "flex h-[72px] flex-col items-center justify-center gap-1 rounded-lg text-sm font-semibold transition max-sm:h-14 max-sm:flex-1",
              active
                ? "bg-zinc-100 text-zinc-950"
                : "bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
            ].join(" ")}
          >
            <Icon size={23} aria-hidden="true" strokeWidth={2.1} />
            <span>{tool.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function TemplatePanel({
  templates,
  customTemplates,
  activeTemplate,
  onChooseTemplate,
  backgroundImages,
}: Pick<
  CoverToolPanelProps,
  | "templates"
  | "customTemplates"
  | "activeTemplate"
  | "onChooseTemplate"
  | "backgroundImages"
>) {
  const presetTemplates = templates.filter(
    (template) => !customTemplates.some((customTemplate) => customTemplate.id === template.id),
  );
  const renderTemplateButton = (template: CoverTemplate) => {
    const imageBackground = backgroundImages.find(
      (background) => background.id === template.backgroundImageId,
    );

    return (
      <button
        key={template.id}
        type="button"
        aria-pressed={template.id === activeTemplate.id}
        onClick={() => onChooseTemplate(template.id)}
        className={[
          "w-full rounded-lg border p-3 text-left transition",
          template.id === activeTemplate.id
            ? "border-zinc-950 bg-zinc-50"
            : "border-zinc-200 bg-white hover:border-zinc-300",
        ].join(" ")}
      >
        <TemplateThumbnail template={template} imageBackground={imageBackground} />
        <span className="block font-semibold">{template.name}</span>
        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {template.description}
        </span>
      </button>
    );
  };

  return (
    <section className="h-full overflow-y-auto pr-1">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">模板</h2>
        <span className="text-sm font-semibold text-zinc-500">{templates.length} 款</span>
      </div>
      <div className="space-y-3">
        {customTemplates.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-zinc-500">我的模板</h3>
            {customTemplates.map(renderTemplateButton)}
          </div>
        )}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-zinc-500">预设模板</h3>
          {presetTemplates.map(renderTemplateButton)}
        </div>
      </div>
    </section>
  );
}

function TextPanel({ onAddTextLayer }: Pick<CoverToolPanelProps, "onAddTextLayer">) {
  return (
    <section className="h-full overflow-y-auto pr-1">
      <h2 className="mb-5 text-xl font-bold">文字</h2>
      <button
        type="button"
        onClick={onAddTextLayer}
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-3 py-3 font-semibold text-white transition hover:bg-zinc-800"
      >
        <Plus size={18} aria-hidden="true" />
        添加文字
      </button>
      <div className="grid grid-cols-2 gap-3 rounded-lg bg-zinc-100 p-3">
        {[
          { label: "标题", sample: "H1" },
          { label: "副标题", sample: "H2" },
          { label: "正文", sample: "Aa" },
          { label: "强调", sample: "abc" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={onAddTextLayer}
            className="rounded-md bg-white px-3 py-4 text-center text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
          >
            <span className="mb-2 block text-2xl font-bold text-zinc-950">{item.sample}</span>
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ImagePanel({
  logoSearchInputRef,
  logoSearchQuery,
  onLogoSearchQueryChange,
  filteredBrandIcons,
  onAddIconLayer,
}: Pick<
  CoverToolPanelProps,
  | "logoSearchInputRef"
  | "logoSearchQuery"
  | "onLogoSearchQueryChange"
  | "filteredBrandIcons"
  | "onAddIconLayer"
>) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">图片素材</h2>
        <a
          href="https://icons.lobehub.com/"
          target="_blank"
          rel="noreferrer"
          title="Logo下载网站"
          aria-label="前往 LobeHub Icons 下载 Logo"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
        >
          <ExternalLink size={18} aria-hidden="true" />
        </a>
      </div>
      <input
        ref={logoSearchInputRef}
        type="search"
        aria-label="搜索 Logo"
        value={logoSearchQuery}
        onChange={(event) => onLogoSearchQueryChange(event.target.value)}
        placeholder="搜索 Logo"
        className="mb-4 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold outline-none transition focus:border-zinc-400 focus:bg-white"
      />
      <div
        aria-label="Logo 素材列表"
        className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto overscroll-contain pr-1"
      >
        {filteredBrandIcons.map((icon) => (
          <button
            key={icon.id}
            type="button"
            aria-label={`添加 ${icon.name} 图标`}
            onClick={() => onAddIconLayer(icon.id)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm font-semibold transition hover:border-zinc-300 hover:bg-white"
          >
            <span
              className={[
                "mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 text-xs",
                icon.className,
              ].join(" ")}
            >
              {icon.src ? (
                <img src={icon.src} alt={`${icon.name} logo`} className="h-7 w-7 object-contain" draggable={false} />
              ) : (
                icon.mark
              )}
            </span>
            {icon.name}
          </button>
        ))}
      </div>
    </section>
  );
}

function BackgroundPanel({
  channelId,
  backgroundTabId,
  onBackgroundTabChange,
  backgroundImages,
  selectedBackground,
  onSelectedBackgroundChange,
  templates,
}: Pick<
  CoverToolPanelProps,
  | "channelId"
  | "backgroundTabId"
  | "onBackgroundTabChange"
  | "backgroundImages"
  | "selectedBackground"
  | "onSelectedBackgroundChange"
  | "templates"
>) {
  const aspectClassName = backgroundPreviewAspectClassName(channelId);

  return (
    <section className="h-full overflow-y-auto pr-1">
      <h2 className="mb-5 text-xl font-bold">背景样式</h2>
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1">
        {[
          { id: "image" as const, label: "图片背景" },
          { id: "color" as const, label: "颜色背景" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={backgroundTabId === tab.id}
            onClick={() => onBackgroundTabChange(tab.id)}
            className={[
              "rounded-md px-3 py-2 text-sm font-bold transition",
              backgroundTabId === tab.id
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-500 hover:text-zinc-950",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {backgroundTabId === "image" &&
          backgroundImages.map((background) => (
            <button
              key={background.id}
              type="button"
              aria-label={`使用 ${background.name} 背景`}
              aria-pressed={selectedBackground.kind === "image" && selectedBackground.id === background.id}
              onClick={() =>
                onSelectedBackgroundChange({
                  kind: "image",
                  id: background.id,
                  src: background.src,
                })
              }
              className={[
                "rounded-lg border bg-white p-2 text-left transition",
                selectedBackground.kind === "image" && selectedBackground.id === background.id
                  ? "border-zinc-950"
                  : "border-zinc-200 hover:border-zinc-300",
              ].join(" ")}
            >
              <img
                src={background.src}
                alt={`${background.name}背景预览`}
                className={["block w-full rounded-md object-cover", aspectClassName].join(" ")}
              />
              <span className="mt-2 block truncate text-sm font-semibold">{background.name}</span>
            </button>
          ))}
        {backgroundTabId === "color" &&
          templates.map((template) => (
            <button
              key={template.id}
              type="button"
              aria-label={`使用 ${template.name} 背景`}
              aria-pressed={selectedBackground.kind === "color" && selectedBackground.id === template.id}
              onClick={() =>
                onSelectedBackgroundChange({
                  kind: "color",
                  id: template.id,
                  className: template.backgroundClassName,
                })
              }
              className={[
                "rounded-lg border bg-white p-2 text-left transition",
                selectedBackground.kind === "color" && selectedBackground.id === template.id
                  ? "border-zinc-950"
                  : "border-zinc-200 hover:border-zinc-300",
              ].join(" ")}
            >
              <span
                role="img"
                aria-label={`${template.name}背景预览`}
                className={["block w-full rounded-md", aspectClassName, template.backgroundClassName].join(" ")}
              />
              <span className="mt-2 block truncate text-sm font-semibold">{template.name}</span>
            </button>
          ))}
      </div>
    </section>
  );
}

export function CoverToolPanel(props: CoverToolPanelProps) {
  return (
    <aside className="flex min-h-0 border-r border-zinc-200 bg-white max-xl:min-h-[520px] max-sm:flex-col xl:h-full">
      <ToolNavigation
        activeToolId={props.activeToolId}
        onActiveToolChange={props.onActiveToolChange}
      />
      <div className="min-h-0 flex-1 overflow-hidden px-5 py-5">
        {props.activeToolId === "templates" && <TemplatePanel {...props} />}
        {props.activeToolId === "text" && <TextPanel {...props} />}
        {props.activeToolId === "image" && <ImagePanel {...props} />}
        {props.activeToolId === "background" && <BackgroundPanel {...props} />}
      </div>
    </aside>
  );
}
