/**
 * 左右對照：例如「常見誤解 vs 較貼近的理解」「舊反應 vs 新選擇」。
 * 每一列是一組對照；手機上同一組上下排列，桌機左右排列。
 */
import { ArrowRight, X, Check } from 'lucide-react';

export default function CompareColumns({ rows, leftTitle, rightTitle }: { rows: { left: string; right: string }[]; leftTitle: string; rightTitle: string }) {
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={i} className="grid items-stretch gap-1.5 sm:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-2xl bg-apricot/25 p-3 text-sm">
            <p className="mb-0.5 flex items-center gap-1 text-xs font-bold text-rose"><X className="h-3.5 w-3.5" aria-hidden />{leftTitle}</p>{r.left}
          </div>
          <ArrowRight className="mx-auto hidden h-5 w-5 self-center text-accent sm:block" aria-hidden />
          <div className="rounded-2xl bg-soft p-3 text-sm">
            <p className="mb-0.5 flex items-center gap-1 text-xs font-bold text-accent"><Check className="h-3.5 w-3.5" aria-hidden />{rightTitle}</p>{r.right}
          </div>
        </li>
      ))}
    </ul>
  );
}
