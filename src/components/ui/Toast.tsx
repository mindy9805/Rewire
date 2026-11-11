/**
 * 操作回饋提示（Toast）
 * 儲存、刪除、複製等操作後顯示簡短訊息；使用 aria-live 讓螢幕閱讀器也能讀出。
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

type ToastKind = 'success' | 'info' | 'error';
interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

const ToastContext = createContext<(text: string, kind?: ToastKind) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-2), { id, kind, text }]);
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => {
          const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? AlertTriangle : Info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex max-w-md items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-bg shadow-card motion-safe:animate-fade-up"
            >
              <Icon className={`h-4 w-4 shrink-0 ${t.kind === 'error' ? 'text-apricot' : 'text-sage'}`} aria-hidden />
              <span>{t.text}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
