/**
 * 習慣五工具：同理溝通模擬器
 * 三個情境 × 多個回應選項；選擇後依五個面向分析。附常用同理句型，可複製與收藏。
 */
import { useState } from 'react';
import { Check, Copy, Heart, Minus } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { copyText } from '../../lib/clipboard';
import { nowIso, uid } from '../../lib/id';
import { EMPATHY_DIMS, empathyPhrases, empathyScenarios } from '../../content/habits7';

export default function EmpathyTool() {
  const { data, upsert, update } = useStore();
  const toast = useToast();
  const [picks, setPicks] = useState<Record<string, number>>({});
  const favs = data.empathyFavorites;

  const choose = (sid: string, i: number) => {
    setPicks((p) => ({ ...p, [sid]: i }));
    upsert('empathyLogs', { id: uid(), scenarioId: sid, choice: i, createdAt: nowIso() });
  };
  const toggleFav = (p: string) => {
    update((d) => ({ ...d, empathyFavorites: d.empathyFavorites.includes(p) ? d.empathyFavorites.filter((x) => x !== p) : [...d.empathyFavorites, p] }));
    toast(favs.includes(p) ? '已取消收藏' : '已收藏句型');
  };

  return (
    <div className="space-y-5">
      {empathyScenarios.map((s, si) => {
        const pick = picks[s.id];
        const chosen = pick !== undefined ? s.options[pick] : null;
        return (
          <fieldset key={s.id} className="rounded-2xl border border-line bg-surface p-4">
            <legend className="px-1 font-serif font-bold">情境 {si + 1}：{s.title}</legend>
            <p className="rounded-xl bg-soft/60 px-3 py-2 text-sm">{s.prompt}</p>
            <p className="mt-3 text-sm font-medium">你會怎麼回應？</p>
            <div className="mt-2 grid gap-2">
              {s.options.map((o, i) => (
                <button key={i} type="button" aria-pressed={pick === i} onClick={() => choose(s.id, i)} className={`rounded-xl border p-3 text-left text-sm transition ${pick === i ? 'border-accent bg-soft' : 'border-line hover:border-accent/50'}`}>{o.text}</button>
              ))}
            </div>
            {chosen && (
              <div className="mt-3 rounded-xl bg-bg p-3 text-sm motion-safe:animate-fade-up" aria-live="polite">
                <p className="font-medium">回應分析</p>
                <ul className="mt-1 grid gap-1 sm:grid-cols-2">
                  {EMPATHY_DIMS.map((d, di) => (
                    <li key={d} className="flex items-center gap-1.5">
                      {chosen.scores[di] ? <Check className="h-4 w-4 text-accent" aria-hidden /> : <Minus className="h-4 w-4 text-muted" aria-hidden />}
                      <span>{d}</span><span className="sr-only">{chosen.scores[di] ? '：有' : '：可以再加強'}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 leading-relaxed">{chosen.note}</p>
              </div>
            )}
          </fieldset>
        );
      })}
      <section aria-labelledby="phr-h" className="rounded-2xl bg-gradient-to-br from-soft to-apricot/25 p-4">
        <h4 id="phr-h" className="font-serif font-bold">常用的同理回應句型</h4>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {empathyPhrases.map((p) => (
            <li key={p} className="flex items-start gap-1 rounded-xl bg-surface p-3 text-sm">
              <span className="flex-1">{p}</span>
              <button className="icon-btn h-8 w-8 shrink-0" aria-pressed={favs.includes(p)} aria-label={favs.includes(p) ? `取消收藏：${p}` : `收藏句型：${p}`} onClick={() => toggleFav(p)}><Heart className={`h-4 w-4 ${favs.includes(p) ? 'fill-current text-[#C0675A]' : ''}`} aria-hidden /></button>
              <button className="icon-btn h-8 w-8 shrink-0" aria-label={`複製句型：${p}`} onClick={async () => toast((await copyText(p)) ? '已複製句型' : '複製失敗', 'info')}><Copy className="h-4 w-4" aria-hidden /></button>
            </li>
          ))}
        </ul>
        {favs.length > 0 && <p className="mt-3 text-xs text-muted">已收藏 {favs.length} 句：{favs.join('／')}</p>}
      </section>
      <p className="text-xs text-muted">已完成 {data.empathyLogs.length} 次練習。這些回應沒有標準答案，分析只是幫助你觀察溝通中的不同面向。</p>
    </div>
  );
}
