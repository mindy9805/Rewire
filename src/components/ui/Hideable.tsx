/**
 * 可隱藏的統計區塊：使用者可自行隱藏任何統計資訊（設定保存在 settings.hiddenStats）
 */
import type { ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/AppStore';

export default function Hideable({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const { data, update } = useStore();
  const hidden = data.settings.hiddenStats.includes(id);
  const set = (h: boolean) => update((p) => ({ ...p, settings: { ...p.settings, hiddenStats: h ? [...p.settings.hiddenStats, id] : p.settings.hiddenStats.filter((x) => x !== id) } }));
  if (hidden) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-line px-4 py-2 text-sm text-muted">
        <EyeOff className="h-4 w-4" aria-hidden />已隱藏「{title}」
        <button className="btn-ghost btn-sm ml-auto" onClick={() => set(false)} aria-label={`顯示「${title}」`}><Eye className="h-4 w-4" aria-hidden />顯示</button>
      </div>
    );
  }
  return (
    <div className="relative">
      <button className="absolute right-0 top-0 z-10 rounded-full p-1.5 text-muted hover:bg-soft" onClick={() => set(true)} aria-label={`隱藏「${title}」`} title="隱藏這個區塊">
        <EyeOff className="h-4 w-4" aria-hidden />
      </button>
      {children}
    </div>
  );
}
