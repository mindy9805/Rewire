/**
 * 因果鏈／流程：A → B → C。只用在內容「確實有先後順序」時（沒有順序的並列內容請用 IconCardGrid）。
 * 手機直向排列、箭頭向下；桌機橫向排列、箭頭向右。
 */
import { ArrowDown, ArrowRight } from 'lucide-react';

export default function ChainDiagram({ steps, title }: { steps: { label: string; text: string }[]; title: string }) {
  return (
    <ol data-visual="chain" className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center" aria-label={title}>
      {steps.map((s, i) => (
        <li key={i} className="flex flex-col items-center gap-1 sm:flex-1 sm:flex-row">
          <div className="w-full rounded-2xl border border-line bg-surface p-3 text-center">
            <p className="text-xs font-bold text-accent">{s.label}</p>
            <p className="text-sm">{s.text}</p>
          </div>
          {i < steps.length - 1 && <><ArrowDown className="h-5 w-5 text-accent sm:hidden" aria-hidden /><ArrowRight className="hidden h-5 w-5 shrink-0 text-accent sm:block" aria-hidden /></>}
        </li>
      ))}
    </ol>
  );
}
