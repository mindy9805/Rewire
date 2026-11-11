/**
 * 工具三：刺激與反應之間的空間（停 → 察 → 選 → 行）
 * 互動情境選擇題，選擇後顯示回饋。
 */
import { useState } from 'react';
import { pauseScenarios } from '../../content/tools';

const STEPS = [
  { k: '停', d: '暫停一下，深呼吸' },
  { k: '察', d: '覺察身體、情緒與念頭' },
  { k: '選', d: '想想選項與自己的價值' },
  { k: '行', d: '採取選擇的行動' },
];

export default function PauseTool() {
  const [picks, setPicks] = useState<Record<string, number>>({});
  return (
    <div className="space-y-5">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.k} className="rounded-2xl bg-soft/70 p-3 text-center">
            <p className="font-serif text-2xl font-bold text-accent">{s.k}</p>
            <p className="text-xs text-muted">{i + 1}. {s.d}</p>
          </li>
        ))}
      </ol>
      {pauseScenarios.map((sc, si) => {
        const pick = picks[sc.id];
        const chosen = pick !== undefined ? sc.options[pick] : null;
        return (
          <fieldset key={sc.id} className="rounded-2xl border border-line bg-surface p-4">
            <legend className="sr-only">情境 {si + 1}</legend>
            <p className="font-medium">情境 {si + 1}：{sc.situation}</p>
            <div className="mt-3 grid gap-2">
              {sc.options.map((o, oi) => (
                <button key={oi} type="button" aria-pressed={pick === oi} onClick={() => setPicks((p) => ({ ...p, [sc.id]: oi }))}
                  className={`rounded-xl border p-3 text-left text-sm transition ${pick === oi ? (o.good ? 'border-accent bg-soft' : 'border-apricot bg-apricot/20') : 'border-line hover:border-accent/50'}`}>
                  {o.text}
                </button>
              ))}
            </div>
            {chosen && (
              <p className="mt-3 rounded-xl bg-soft/70 px-3 py-2 text-sm" aria-live="polite">
                <span className="chip mr-2">{chosen.step}</span>{chosen.feedback}
              </p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
