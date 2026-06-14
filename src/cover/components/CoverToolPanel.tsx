import {
  ExternalLink,
  Image as ImageIcon,
  LayoutTemplate,
  Paintbrush,
  Plus,
  Star,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import type { ChangeEvent, RefObject } from "react";
import {
  type BrandIcon,
  type BrandIconId,
  type CoverBackgroundImage,
  type CoverChannelId,
  type CoverTemplate,
  getChannel,
} from "@/cover/lib/cover";
import type { CustomCoverBackgroundImage, FavoriteTimes } from "@/cover/lib/coverPreferences";
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
  return channelId === "wechat" ? 0.125 : 0.09;
}

type CoverToolPanelProps = {
  activeToolId: CoverToolId;
  expanded: boolean;
  onActiveToolChange: (toolId: CoverToolId) => void;
  templates: CoverTemplate[];
  customTemplates: CoverTemplate[];
  templateFavoriteTimes: FavoriteTimes;
  activeTemplate: CoverTemplate;
  onChooseTemplate: (templateId: string) => void;
  onToggleTemplateFavorite: (templateId: string) => void;
  onDeleteCustomTemplate: (templateId: string) => void;
  onAddTextLayer: () => void;
  logoSearchInputRef: RefObject<HTMLInputElement>;
  logoSearchQuery: string;
  onLogoSearchQueryChange: (query: string) => void;
  filteredBrandIcons: BrandIcon[];
  onAddIconLayer: (iconId: BrandIconId) => void;
  onUploadImage: (file: File) => void;
  channelId: CoverChannelId;
  backgroundTabId: CoverBackgroundTabId;
  onBackgroundTabChange: (tabId: CoverBackgroundTabId) => void;
  backgroundImages: CoverBackgroundImage[];
  customBackgroundImages: CustomCoverBackgroundImage[];
  backgroundFavoriteTimes: FavoriteTimes;
  selectedBackground: CoverBackgroundSelection;
  onSelectedBackgroundChange: (background: CoverBackgroundSelection) => void;
  onToggleBackgroundFavorite: (backgroundId: string) => void;
  onDeleteCustomBackground: (backgroundId: string) => void;
  onUploadBackground: (file: File) => void;
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
      className={[
        "mx-auto mb-2 block overflow-hidden rounded-md border border-[#f3f0ef] bg-white bg-cover bg-center",
        template.backgroundClassName,
      ].join(" ")}
      style={{
        width: `${channel.width * previewScale}px`,
        maxWidth: "100%",
        aspectRatio: `${channel.width} / ${channel.height}`,
        ...backgroundStyle,
      }}
    />
  );
}

function ToolNavigation({
  activeToolId,
  expanded,
  onActiveToolChange,
}: Pick<CoverToolPanelProps, "activeToolId" | "expanded" | "onActiveToolChange">) {
  return (
    <nav
      aria-label="封面功能栏"
      className="flex w-[76px] shrink-0 flex-col gap-2 border-r border-[#f3f0ef] bg-[#f3f0ef] px-2 py-4 max-sm:w-full max-sm:flex-row max-sm:border-b max-sm:border-r-0"
    >
      {COVER_TOOLS.map((tool) => {
        const Icon = tool.icon;
        const active = tool.id === activeToolId;
        const expandedTool = active && expanded;
        return (
          <button
            key={tool.id}
            type="button"
            aria-pressed={active}
            aria-expanded={expandedTool}
            onClick={() => onActiveToolChange(tool.id)}
            className={[
              "flex h-[66px] flex-col items-center justify-center gap-1 rounded-md border text-xs font-semibold transition max-sm:h-14 max-sm:flex-1",
              active
                ? "border-[#26251e] bg-[#fcfaf8] text-[#26251e] shadow-sm"
                : "border-transparent text-[#504f49] hover:border-[#979696]/45 hover:bg-white/80 hover:text-[#26251e]",
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
  templateFavoriteTimes,
  activeTemplate,
  onChooseTemplate,
  onToggleTemplateFavorite,
  onDeleteCustomTemplate,
  backgroundImages,
}: Pick<
  CoverToolPanelProps,
  | "templates"
  | "customTemplates"
  | "templateFavoriteTimes"
  | "activeTemplate"
  | "onChooseTemplate"
  | "onToggleTemplateFavorite"
  | "onDeleteCustomTemplate"
  | "backgroundImages"
>) {
  const customTemplateIds = new Set(customTemplates.map((template) => template.id));
  const customTemplateItems = templates.filter((template) => customTemplateIds.has(template.id));
  const presetTemplateItems = templates.filter((template) => !customTemplateIds.has(template.id));
  const renderTemplateButton = (template: CoverTemplate) => {
    const imageBackground = backgroundImages.find(
      (background) => background.id === template.backgroundImageId,
    );
    const isFavorite = Boolean(templateFavoriteTimes[template.id]);
    const isCustom = customTemplateIds.has(template.id);

    return (
      <div key={template.id} className="group relative">
        <button
          type="button"
          aria-label={`选择 ${template.name} 模板`}
          aria-pressed={template.id === activeTemplate.id}
          onClick={() => onChooseTemplate(template.id)}
          className={[
            "w-full rounded-lg border p-2 text-center transition",
            template.id === activeTemplate.id
              ? "border-[#26251e] bg-[#f6f1ea] ring-1 ring-black/10"
              : "border-[#f3f0ef] bg-white hover:border-[#979696]/45 hover:bg-[#f6f1ea]",
          ].join(" ")}
        >
          <TemplateThumbnail template={template} imageBackground={imageBackground} />
          <span className="block text-sm font-semibold">{template.name}</span>
        </button>
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            aria-label={`${isFavorite ? "取消收藏" : "收藏"} ${template.name} 模板`}
            title={`${isFavorite ? "取消收藏" : "收藏"}模板`}
            onClick={() => onToggleTemplateFavorite(template.id)}
            className={[
              "inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white/95 shadow-sm transition",
              isFavorite
                ? "border-[#26251e] text-[#26251e]"
                : "border-[#f3f0ef] text-[#979696] opacity-0 hover:text-[#26251e] group-hover:opacity-100 group-focus-within:opacity-100",
            ].join(" ")}
          >
            <Star size={16} aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} />
          </button>
          {isCustom && (
            <button
              type="button"
              aria-label={`删除 ${template.name} 模板`}
              title="删除自定义模板"
              onClick={() => onDeleteCustomTemplate(template.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#f3f0ef] bg-white/95 text-[#979696] opacity-0 shadow-sm transition hover:border-[#fca5a5] hover:text-[#dc2626] group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  };
  const renderTemplateSection = (label: string, sectionTemplates: CoverTemplate[]) =>
    sectionTemplates.length > 0 && (
      <div className="grid grid-cols-2 gap-3">
        <h3 className="col-span-full text-xs font-semibold uppercase tracking-[0.08em] text-[#504f49]">{label}</h3>
        {sectionTemplates.map(renderTemplateButton)}
      </div>
    );

  return (
    <section className="h-full overflow-y-auto pr-1">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#26251e]">模板</h2>
        <span className="text-sm font-medium text-[#504f49]">{templates.length} 款</span>
      </div>
      <div className="space-y-3">
        {renderTemplateSection("我的模板", customTemplateItems)}
        {renderTemplateSection("预设模板", presetTemplateItems)}
      </div>
    </section>
  );
}

function TextPanel({ onAddTextLayer }: Pick<CoverToolPanelProps, "onAddTextLayer">) {
  return (
    <section className="h-full overflow-y-auto pr-1">
      <h2 className="mb-5 text-lg font-semibold text-[#26251e]">文字</h2>
      <button
        type="button"
        onClick={onAddTextLayer}
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#26251e] px-3 py-3 font-semibold text-[#fafafa] transition hover:bg-[#3a3933]"
      >
        <Plus size={18} aria-hidden="true" />
        添加文字
      </button>
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#979696]/35 bg-[#f3f0ef] p-3">
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
            className="rounded-md border border-[#f3f0ef] bg-white px-3 py-4 text-center text-sm font-semibold text-[#504f49] transition hover:border-[#979696]/45 hover:text-[#26251e]"
          >
            <span className="mb-2 block text-2xl font-bold text-[#26251e]">{item.sample}</span>
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
  onUploadImage,
}: Pick<
  CoverToolPanelProps,
  | "logoSearchInputRef"
  | "logoSearchQuery"
  | "onLogoSearchQueryChange"
  | "filteredBrandIcons"
  | "onAddIconLayer"
  | "onUploadImage"
>) {
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUploadImage(file);
    event.target.value = "";
  };

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#26251e]">图片素材</h2>
        <a
          href="https://icons.lobehub.com/"
          target="_blank"
          rel="noreferrer"
          title="Logo下载网站"
          aria-label="前往 LobeHub Icons 下载 Logo"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#f3f0ef] bg-white text-[#504f49] transition hover:border-[#979696]/45 hover:bg-[#f6f1ea] hover:text-[#26251e]"
        >
          <ExternalLink size={18} aria-hidden="true" />
        </a>
      </div>
      <label className="mb-3 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#979696]/45 bg-[#26251e] px-3 text-sm font-semibold text-white transition hover:bg-[#3a3933]">
        <Upload size={17} aria-hidden="true" />
        上传图片
        <input
          type="file"
          accept="image/*"
          aria-label="上传图片素材"
          onChange={handleImageUpload}
          className="sr-only"
        />
      </label>
      <input
        ref={logoSearchInputRef}
        type="search"
        aria-label="搜索 Logo"
        value={logoSearchQuery}
        onChange={(event) => onLogoSearchQueryChange(event.target.value)}
        placeholder="搜索 Logo"
        className="mb-4 h-11 w-full rounded-md border border-[#979696]/55 bg-white px-3 text-sm font-medium text-[#26251e] outline-none transition placeholder:text-[#979696] focus:border-[#26251e] focus:ring-2 focus:ring-black/10"
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
            className="rounded-lg border border-[#f3f0ef] bg-white p-3 text-sm font-semibold text-[#26251e] transition hover:border-[#979696]/45 hover:bg-[#f6f1ea]"
          >
            <span
              className={[
                "mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md border border-[#f3f0ef] text-xs",
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
  customBackgroundImages,
  backgroundFavoriteTimes,
  selectedBackground,
  onSelectedBackgroundChange,
  onToggleBackgroundFavorite,
  onDeleteCustomBackground,
  onUploadBackground,
  templates,
}: Pick<
  CoverToolPanelProps,
  | "channelId"
  | "backgroundTabId"
  | "onBackgroundTabChange"
  | "backgroundImages"
  | "customBackgroundImages"
  | "backgroundFavoriteTimes"
  | "selectedBackground"
  | "onSelectedBackgroundChange"
  | "onToggleBackgroundFavorite"
  | "onDeleteCustomBackground"
  | "onUploadBackground"
  | "templates"
>) {
  const aspectClassName = backgroundPreviewAspectClassName(channelId);
  const customBackgroundIds = new Set(customBackgroundImages.map((background) => background.id));
  const renderImageBackgroundButton = (background: CoverBackgroundImage) => {
    const isFavorite = Boolean(backgroundFavoriteTimes[background.id]);
    const isCustom = customBackgroundIds.has(background.id);

    return (
      <div key={background.id} className="group relative">
        <button
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
            "w-full rounded-lg border bg-white p-2 text-left transition",
            selectedBackground.kind === "image" && selectedBackground.id === background.id
              ? "border-[#26251e] ring-1 ring-black/10"
              : "border-[#f3f0ef] hover:border-[#979696]/45 hover:bg-[#f6f1ea]",
          ].join(" ")}
        >
          <img
            src={background.src}
            alt={`${background.name}背景预览`}
            className={["block w-full rounded-md object-cover", aspectClassName].join(" ")}
          />
          <span className="mt-2 block truncate text-sm font-semibold">{background.name}</span>
        </button>
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            aria-label={`${isFavorite ? "取消收藏" : "收藏"} ${background.name} 背景`}
            title={`${isFavorite ? "取消收藏" : "收藏"}背景`}
            onClick={() => onToggleBackgroundFavorite(background.id)}
            className={[
              "inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white/95 shadow-sm transition",
              isFavorite
                ? "border-[#26251e] text-[#26251e]"
                : "border-[#f3f0ef] text-[#979696] opacity-0 hover:text-[#26251e] group-hover:opacity-100 group-focus-within:opacity-100",
            ].join(" ")}
          >
            <Star size={16} aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} />
          </button>
          {isCustom && (
            <button
              type="button"
              aria-label={`删除 ${background.name} 背景`}
              title="删除自定义背景"
              onClick={() => onDeleteCustomBackground(background.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#f3f0ef] bg-white/95 text-[#979696] opacity-0 shadow-sm transition hover:border-[#fca5a5] hover:text-[#dc2626] group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  };
  const renderBackgroundSection = (
    label: string,
    sectionBackgrounds: CoverBackgroundImage[],
  ) =>
    sectionBackgrounds.length > 0 && (
      <>
        <h3 className="col-span-full text-xs font-semibold uppercase tracking-[0.08em] text-[#504f49]">{label}</h3>
        {sectionBackgrounds.map(renderImageBackgroundButton)}
      </>
    );

  return (
    <section className="h-full overflow-y-auto pr-1">
      <h2 className="mb-5 text-lg font-semibold text-[#26251e]">背景样式</h2>
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-md border border-[#979696]/35 bg-[#f3f0ef] p-1">
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
              "rounded-md px-3 py-2 text-sm font-semibold transition",
              backgroundTabId === tab.id
                ? "bg-white text-[#26251e] shadow-sm"
                : "text-[#504f49] hover:text-[#26251e]",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {backgroundTabId === "image" && (
        <label className="mb-4 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#979696] bg-white px-3 text-sm font-semibold text-[#26251e] transition hover:border-[#26251e] hover:bg-[#f6f1ea]">
          <Upload size={17} aria-hidden="true" />
          上传背景图
          <input
            type="file"
            accept="image/*"
            aria-label="上传自定义背景图"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              onUploadBackground(file);
              event.target.value = "";
            }}
          />
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        {backgroundTabId === "image" && renderBackgroundSection("图片背景", backgroundImages)}
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
                  ? "border-[#26251e] ring-1 ring-black/10"
                  : "border-[#f3f0ef] hover:border-[#979696]/45 hover:bg-[#f6f1ea]",
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
    <aside
      className={[
        "flex min-h-0 border-r border-[#f3f0ef] bg-[#fcfaf8] max-sm:flex-col xl:h-full",
        props.expanded ? "max-xl:min-h-[520px]" : "max-xl:min-h-0",
      ].join(" ")}
    >
      <ToolNavigation
        activeToolId={props.activeToolId}
        expanded={props.expanded}
        onActiveToolChange={props.onActiveToolChange}
      />
      {props.expanded && (
        <div className="min-h-0 flex-1 overflow-hidden px-5 py-5">
          {props.activeToolId === "templates" && <TemplatePanel {...props} />}
          {props.activeToolId === "text" && <TextPanel {...props} />}
          {props.activeToolId === "image" && <ImagePanel {...props} />}
          {props.activeToolId === "background" && <BackgroundPanel {...props} />}
        </div>
      )}
    </aside>
  );
}
