/** 編號步驟卡：替代行動、行動策略、實驗步驟。每張卡：編號＋（可選）圖示＋原句。 */
import type { LucideIcon } from 'lucide-react';

export default function StepCards({ steps }: { steps: { text: string; icon?: LucideIcon }[] }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2">
      {steps.map(({ text, icon: Icon }, i) => (
        <li key={i} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-display text-onaccent" aria-hidden>{i + 1}</span>
          {Icon && <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden />}
          <span className="text-sm leading-relaxed"><span className="sr-only">第 {i + 1} 步：</span>{text}</span>
        </li>
      ))}
    </ol>
  );
}
