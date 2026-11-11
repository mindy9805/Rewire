/**
 * 確認視窗（刪除、清除資料前使用）
 * - 使用原生 <dialog>：內建焦點管理、Esc 關閉與背景遮罩，鍵盤操作友善。
 * - 以 useConfirm() 取得 confirm(options) 函式，回傳 Promise<boolean>。
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  danger?: boolean;
}

const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(v: boolean) => void>();
  const ref = useRef<HTMLDialogElement>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (opts && d && !d.open) d.showModal();
  }, [opts]);

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = undefined;
    ref.current?.close();
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={ref}
        aria-labelledby="confirm-title"
        onCancel={(e) => {
          e.preventDefault();
          close(false);
        }}
        className="w-[min(92vw,26rem)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-ink/40"
      >
        {opts && (
          <div className="p-6">
            <h2 id="confirm-title" className="font-serif text-lg font-bold">
              {opts.title}
            </h2>
            {opts.message && <p className="mt-2 text-sm leading-relaxed text-muted">{opts.message}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => close(false)} autoFocus>
                取消
              </button>
              <button className={opts.danger ? 'btn-danger' : 'btn-primary'} onClick={() => close(true)}>
                {opts.confirmText ?? '確定'}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
