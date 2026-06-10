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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1f1f]/35 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="选择模板应用方式"
        className="w-full max-w-[380px] rounded-lg border border-[#e6d5a8] bg-white p-5 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-[#1f1f1f]">使用「{templateName}」</h2>
        <p className="mt-2 text-sm leading-6 text-[#6a6a6a]">
          可以新增一个画板保留当前设计，也可以直接覆盖当前画板。
        </p>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            disabled={!canCreateBoard}
            onClick={onCreateBoard}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#fa520f] px-4 text-sm font-semibold text-white transition hover:bg-[#cc3a05] disabled:cursor-not-allowed disabled:opacity-50"
          >
            新增画板使用模板
          </button>
          <button
            type="button"
            onClick={onOverwriteBoard}
            className="inline-flex h-11 items-center justify-center rounded-md border border-[#c7c7c7] bg-white px-4 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#fffaeb]"
          >
            覆盖当前画板
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-md text-sm font-semibold text-[#6a6a6a] transition hover:bg-[#f6f7f9] hover:text-[#1f1f1f]"
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
