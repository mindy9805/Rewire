/** 手機／平板的抽屜選單（含焦點管理與 Esc 關閉） */
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import NavLists from './NavLists';

export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('button, a')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="網站選單">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div ref={panel} className="absolute inset-y-0 left-0 w-[min(85vw,20rem)] overflow-y-auto bg-bg px-3 py-4 shadow-card motion-safe:animate-fade-up">
        <div className="mb-4 flex items-center justify-between px-2">
          <span className="font-display text-lg font-bold text-forest">Rewire</span>
          <button className="icon-btn" onClick={onClose} aria-label="關閉選單">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <NavLists />
      </div>
    </div>
  );
}
