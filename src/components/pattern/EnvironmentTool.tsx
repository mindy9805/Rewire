/**
 * Habit 06 工具：成長環境盤點
 * 依六個面向評估一個環境或關係，產生「以反思為主」的整理；不替使用者決定是否結束任何關係。
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { TextArea, TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import { environmentItems, environmentScale } from '../../content/breakPattern';
import { environmentReflection } from '../../lib/pattern';
import type { EnvironmentEntry } from '../../types';
import { DeleteButton, EntryCard } from './EntryList';
import PracticeAffirmation from './PracticeAffirmation';

export default function EnvironmentTool({ affirmationIds }: { affirmationIds: number[] }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [label, setLabel] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const complete = environmentItems.every((i) => ratings[i.id]);
  const r = environmentReflection(ratings);
  const list = data.patternEntries.filter((e): e is EnvironmentEntry => e.kind === 'environment');

  const save = () => {
    const t = nowIso();
    upsert('patternEntries', { id: uid(), kind: 'environment', habitId: 'environment', label: label.trim() || '未命名環境', ratings, note: note.trim(), createdAt: t, updatedAt: t });
    toast('已儲存環境盤點');
    setLabel(''); setRatings({}); setNote('');
    setDone(true);
  };

  return (
    <div className="space-y-4">
      <TextField label="想盤點的環境或關係（可用代稱）" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="例如：工作團隊、大學朋友圈" />
      <div className="space-y-3">
        {environmentItems.map((it, i) => (
          <fieldset key={it.id} className="rounded-xl border border-line bg-surface p-3">
            <legend className="px-1 text-sm font-medium">{i + 1}. {it.text}</legend>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {environmentScale.map((s, si) => (
                <button key={s} type="button" aria-pressed={ratings[it.id] === si + 1} onClick={() => setRatings((x) => ({ ...x, [it.id]: si + 1 }))} className={ratings[it.id] === si + 1 ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{s}</button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {complete && (
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed motion-safe:animate-fade-up" aria-live="polite">
          <p className="font-serif text-lg font-bold">反思整理</p>
          <div><p className="font-medium text-accent">這段環境中的支持力量</p>{r.strengths.length ? <ul>{r.strengths.map((s) => <li key={s}>・{s}</li>)}</ul> : <p className="text-muted">目前沒有特別明顯的支持面向。</p>}</div>
          <div><p className="font-medium text-accent">值得留意的部分</p>{r.attention.length ? <ul>{r.attention.map((s) => <li key={s}>・{s}</li>)}</ul> : <p className="text-muted">目前沒有特別需要留意的面向。</p>}</div>
          <div>
            <p className="font-medium text-accent">可以思考的問題</p>
            <ul>
              <li>・這些感受是長期的模式，還是最近的特殊情況？</li>
              <li>・有沒有一個界線，是我可以溫和說出口的？</li>
              <li>・除了這個環境，我還能從哪裡獲得支持？</li>
            </ul>
          </div>
          <p className="rounded-xl bg-soft/70 px-3 py-2 text-xs">這份整理只是幫助你觀察互動模式，不會替你決定是否調整或結束任何關係。每個人都有低潮與需要支持的時候。若你在關係中感到不安全，請優先照顧自己的安全並尋求協助（緊急狀況 110／113 保護專線）。</p>
          <p className="text-xs">延伸練習：<Link to="/lab/pocket" className="text-accent underline">口袋句（表達需求、拒絕）</Link>・<Link to="/lab/labeling" className="text-accent underline">情緒命名</Link></p>
          <TextArea label="我的觀察與下一步（選填）" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-primary" onClick={save}>儲存盤點</button>
        </div>
      )}
      {!complete && <p className="text-xs text-muted">完成六個面向後會顯示反思整理（已完成 {Object.keys(ratings).length}/6）。</p>}
      {done && <PracticeAffirmation ids={affirmationIds} onClose={() => setDone(false)} />}
      {list.length > 0 && (
        <ul className="space-y-2">
          {list.map((e) => {
            const rr = environmentReflection(e.ratings);
            return (
              <EntryCard key={e.id} title={e.label} at={e.createdAt} actions={<DeleteButton collection="patternEntries" id={e.id} label="環境盤點" />}>
                <p><span className="text-muted">支持：</span>{rr.strengths.join('、') || '—'}</p>
                <p><span className="text-muted">留意：</span>{rr.attention.join('、') || '—'}</p>
                {e.note && <p className="text-muted">{e.note}</p>}
              </EntryCard>
            );
          })}
        </ul>
      )}
    </div>
  );
}
