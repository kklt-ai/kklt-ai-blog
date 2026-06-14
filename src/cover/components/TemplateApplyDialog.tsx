type TemplateApplyDialogProps = {
  templateName: string;
  canCreateBoard: boolean;
  onCreateBoard: () => void;
  onOverwriteBoard: () => void;
  onCancel: () => void;
};

export function TemplateApplyDialog({
  templateName,
  canCreateBoard,
  onCreateBoard,
  onOverwriteBoard,
  onCancel,
}: TemplateApplyDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26251e]/35 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="选择模板应用方式"
        className="w-full max-w-[380px] rounded-lg border border-[#979696]/35 bg-white p-5 shadow-[0_16px_48px_-8px_rgba(38,37,30,0.18)]"
      >
        <h2 className="text-lg font-semibold text-[#26251e]">使用「{templateName}」</h2>
        <p className="mt-2 text-sm leading-6 text-[#504f49]">
          可以新增一个画板保留当前设计，也可以直接覆盖当前画板。
        </p>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            disabled={!canCreateBoard}
            onClick={onCreateBoard}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#26251e] px-4 text-sm font-semibold text-[#fafafa] transition hover:bg-[#3a3933] disabled:cursor-not-allowed disabled:opacity-50"
          >
            新增画板使用模板
          </button>
          <button
            type="button"
            onClick={onOverwriteBoard}
            className="inline-flex h-11 items-center justify-center rounded-md border border-[#979696] bg-white px-4 text-sm font-semibold text-[#26251e] transition hover:bg-[#f6f1ea]"
          >
            覆盖当前画板
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-md text-sm font-semibold text-[#504f49] transition hover:bg-[#f6f1ea] hover:text-[#26251e]"
          >
            取消
          </button>
        </div>
        {!canCreateBoard && (
          <p className="mt-3 text-xs font-semibold text-[#dc2626]">
            最多保留 10 个画板，请删除旧画板后再新增。
          </p>
        )}
      </div>
    </div>
  );
}
