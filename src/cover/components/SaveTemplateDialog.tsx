type SaveTemplateDialogProps = {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SaveTemplateDialog({
  message,
  onCancel,
  onConfirm,
}: SaveTemplateDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="保存为模板"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#26251e]/45 px-4"
    >
      <div className="w-full max-w-md rounded-lg border border-[#979696]/35 bg-white p-6 shadow-[0_16px_48px_-8px_rgba(38,37,30,0.18)]">
        <h2 className="text-lg font-semibold text-[#26251e]">保存为模板</h2>
        <div className="mt-3 space-y-2 text-sm font-medium leading-6 text-[#504f49]">
          <p>这个功能会把当前封面的文字、图标、背景和特效保存到浏览器里。</p>
          <p>保存后会出现在“我的模板”，下次打开这个浏览器也能继续复用。</p>
          <p>如果当前模板已经保存过，系统会提示并避免重复添加。</p>
        </div>
        {message && (
          <p role="alert" className="mt-4 rounded-md border border-[#979696]/35 bg-[#f3f0ef] px-3 py-2 text-sm font-semibold text-[#26251e]">
            {message}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#979696] bg-white px-4 py-2 text-sm font-semibold text-[#26251e] transition hover:border-[#26251e] hover:bg-[#f6f1ea]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-[#26251e] px-4 py-2 text-sm font-semibold text-[#fafafa] transition hover:bg-[#3a3933]"
          >
            确认保存
          </button>
        </div>
      </div>
    </div>
  );
}
