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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1f1f]/45 px-4"
    >
      <div className="w-full max-w-md rounded-xl border border-[#e6d5a8] bg-white p-6 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)]">
        <h2 className="text-lg font-semibold text-[#1f1f1f]">保存为模板</h2>
        <div className="mt-3 space-y-2 text-sm font-medium leading-6 text-[#4a4a4a]">
          <p>这个功能会把当前封面的文字、图标、背景和特效保存到浏览器里。</p>
          <p>保存后会出现在“我的模板”，下次打开这个浏览器也能继续复用。</p>
          <p>如果当前模板已经保存过，系统会提示并避免重复添加。</p>
        </div>
        {message && (
          <p role="alert" className="mt-4 rounded-md border border-[#e6d5a8] bg-[#fff8e0] px-3 py-2 text-sm font-semibold text-[#cc3a05]">
            {message}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#c7c7c7] bg-white px-4 py-2 text-sm font-semibold text-[#3d3d3d] transition hover:border-[#8a8a8a] hover:bg-[#fffaeb] hover:text-[#1f1f1f]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-[#fa520f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#cc3a05]"
          >
            确认保存
          </button>
        </div>
      </div>
    </div>
  );
}
