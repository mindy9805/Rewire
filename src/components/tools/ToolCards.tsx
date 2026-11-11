/**
 * 七張可展開的互動工具卡（第 7 章與 Brain Lab 共用）
 */
import { useState } from 'react';
import { ChevronDown, Wind, Tags, PauseCircle, Clapperboard, Footprints, MessageSquareQuote, Moon, type LucideIcon } from 'lucide-react';
import SighTool from './SighTool';
import AffectLabeling from './AffectLabeling';
import PauseTool from './PauseTool';
import RehearsalTool from './RehearsalTool';
import SmallStepsTool from './SmallStepsTool';
import PocketPhrases from './PocketPhrases';
import SleepTool from './SleepTool';

export const TOOLS: { id: string; no: number; title: string; en: string; desc: string; icon: LucideIcon; El: () => JSX.Element }[] = [
  { id: 'sigh', no: 1, title: '生理性嘆息', en: 'Physiological Sigh', desc: '兩段鼻吸氣、緩慢長吐氣，用於短暫壓力調節。', icon: Wind, El: SighTool },
  { id: 'labeling', no: 2, title: '情緒命名', en: 'Affect Labeling', desc: '用情緒輪盤把模糊的感受轉成具體詞彙。', icon: Tags, El: AffectLabeling },
  { id: 'pause', no: 3, title: '刺激與反應之間的空間', en: 'Stop · Notice · Choose · Act', desc: '停 → 察 → 選 → 行，練習不自動反應。', icon: PauseCircle, El: PauseTool },
  { id: 'rehearsal', no: 4, title: '完整心智預演', en: 'Mental Rehearsal', desc: '理想情境＋可能障礙＋具體應對策略。', icon: Clapperboard, El: RehearsalTool },
  { id: 'steps', no: 5, title: '微小行動', en: 'Small Steps', desc: '把大目標拆成不太可能失敗的微行動。', icon: Footprints, El: SmallStepsTool },
  { id: 'pocket', no: 6, title: '口袋句', en: 'Pocket Phrases', desc: '拒絕、表達需求、爭取時間的可複製句型。', icon: MessageSquareQuote, El: PocketPhrases },
  { id: 'sleep', no: 7, title: '睡眠與記憶鞏固', en: 'Sleep & Consolidation', desc: '簡易睡眠紀錄與趨勢圖（非醫療工具）。', icon: Moon, El: SleepTool },
];

export default function ToolCards({ initial }: { initial?: string }) {
  const [open, setOpen] = useState<string | null>(initial ?? null);
  return (
    <div className="space-y-3">
      {TOOLS.map(({ id, no, title, en, desc, icon: Icon, El }) => {
        const isOpen = open === id;
        return (
          <section key={id} id={`tool-${id}`} className={`overflow-hidden rounded-2xl border bg-surface shadow-card transition ${isOpen ? 'border-accent/50' : 'border-line'}`}>
            <h3 className="m-0">
              <button className="flex w-full items-center gap-4 p-4 text-left sm:p-5" aria-expanded={isOpen} aria-controls={`tool-panel-${id}`} onClick={() => setOpen(isOpen ? null : id)}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft text-accent"><Icon className="h-5 w-5" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xs text-muted">Tool {no} · {en}</span>
                  <span className="block font-serif text-lg font-bold">{title}</span>
                  <span className="block font-sans text-sm font-normal text-muted">{desc}</span>
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
              </button>
            </h3>
            {isOpen && (
              <div id={`tool-panel-${id}`} className="border-t border-line p-4 sm:p-6 motion-safe:animate-fade-up">
                <El />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
