/**
 * 認知濾鏡實驗（第 2 章）
 * 選擇情境與解讀方式，呈現「事件 → 解讀 → 情緒 → 行為 → 結果」，並以四個問題引導反思，可存入筆記。
 */
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { filterScenarios } from '../../content/tools';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { TextArea } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';

const questions = ['我觀察到哪些客觀事實？', '我做了哪些推測？', '還有哪些可能的解釋？', '有沒有忽略其他證據？'];

export default function CognitiveFilter() {
  const [sid, setSid] = useState(filterScenarios[0].id);
  const [pick, setPick] = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const { upsert } = useStore();
  const toast = useToast();
  const sc = filterScenarios.find((s) => s.id === sid)!;
  const it = pick !== null ? sc.interpretations[pick] : null;

  const save = () => {
    const t = nowIso();
    const content = [`情境：${sc.event}`, ...questions.map((q, i) => `${q}\n${answers[i] || '（未填）'}`)].join('\n\n');
    upsert('notes', { id: uid(), chapterId: 'ch2', kind: 'reflection', source: `認知濾鏡實驗：${sc.title}`, content, tags: ['認知濾鏡'], createdAt: t, updatedAt: t });
    toast('已存入第 2 章筆記');
    setAnswers(['', '', '', '']);
  };

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="選擇情境" className="flex flex-wrap gap-2">
        {filterScenarios.map((s) => (
          <button key={s.id} role="tab" aria-selected={s.id === sid} className={s.id === sid ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => { setSid(s.id); setPick(null); }}>
            {s.title}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-soft/70 p-4">
        <p className="text-xs font-medium text-accent">事件（客觀發生的事）</p>
        <p className="mt-1">{sc.event}</p>
      </div>
      <fieldset>
        <legend className="field-label">你的第一個念頭比較接近哪一個？</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {sc.interpretations.map((x, i) => (
            <button key={x.label} type="button" aria-pressed={pick === i} onClick={() => setPick(i)} className={`rounded-xl border p-3 text-left text-sm transition ${pick === i ? 'border-accent bg-soft' : 'border-line bg-surface hover:border-accent/50'}`}>
              <span className="font-medium">「{x.label}」</span>
              <span className="mt-1 block text-muted">{x.thought}</span>
            </button>
          ))}
        </div>
      </fieldset>
      {it && (
        <div className="motion-safe:animate-fade-up" aria-live="polite">
          <ol className="grid gap-2 md:grid-cols-5">
            {[
              ['事件', sc.event],
              ['解讀', it.thought],
              ['情緒', it.emotion],
              ['行為', it.behavior],
              ['結果', it.outcome],
            ].map(([k, v], i) => (
              <li key={k} className="relative rounded-xl border border-line bg-surface p-3 text-sm">
                <p className="font-medium text-accent">{i + 1}. {k}</p>
                <p className="mt-1 leading-relaxed">{v}</p>
                {i < 4 && <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-sage md:block" aria-hidden />}
              </li>
            ))}
          </ol>
          <p className={`mt-3 rounded-xl px-3 py-2 text-sm ${it.type === 'negative' ? 'bg-apricot/30' : 'bg-soft'}`}>
            {it.type === 'negative'
              ? '這個解讀很常見，也可以理解。它可能把推論當成事實了——試試看選擇其他解讀，比較結果的差異。'
              : '這個解讀保留了更多可能性，讓情緒與行動有更多空間。它不是「假裝沒事」，而是更貼近已知的事實。'}
          </p>
        </div>
      )}
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <p className="font-serif font-bold">反思練習</p>
        <div className="mt-3 grid gap-3">
          {questions.map((q, i) => (
            <TextArea key={q} label={q} rows={2} value={answers[i]} onChange={(e) => setAnswers((a) => a.map((x, j) => (j === i ? e.target.value : x)))} />
          ))}
        </div>
        <button className="btn-primary mt-3" onClick={save} disabled={answers.every((a) => !a.trim())}>
          存入筆記
        </button>
      </div>
    </div>
  );
}
