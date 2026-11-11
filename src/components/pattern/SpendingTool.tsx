/**
 * Habit 03 工具：消費動機檢視器
 * 輸入物品、價格、原因、使用頻率、預算與替代方案 → 產生反思（實際需求、社會比較、長期成本、下一步）。
 * 提供自訂冷靜期與決定紀錄。⚠️ 不將任何消費判定為錯誤。
 */
import { useState } from 'react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import { toDateKey, formatDate } from '../../lib/date';
import { spendingReasons } from '../../content/breakPattern';
import { spendingReflection } from '../../lib/pattern';
import type { SpendingEntry } from '../../types';
import { DeleteButton, EntryCard } from './EntryList';
import PracticeAffirmation from './PracticeAffirmation';

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateKey(d);
};
const decisionLabel: Record<SpendingEntry['decision'], string> = { pending: '冷靜期中', bought: '決定購買', skipped: '決定不買', postponed: '再延後' };

export default function SpendingTool({ affirmationIds }: { affirmationIds: number[] }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [reasonNote, setReasonNote] = useState('');
  const [uses, setUses] = useState('');
  const [budget, setBudget] = useState<SpendingEntry['budget']>('unsure');
  const [alternative, setAlternative] = useState('');
  const [cooling, setCooling] = useState(2);
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState(false);
  const list = data.patternEntries.filter((e): e is SpendingEntry => e.kind === 'spending');
  const ref = spendingReflection({ price: Number(price) || 0, reasons, usesPerMonth: Number(uses) || 0, budget, alternative });
  const today = toDateKey();

  const save = () => {
    const t = nowIso();
    upsert('patternEntries', { id: uid(), kind: 'spending', habitId: 'impress', item: item.trim(), price: Number(price) || 0, reasons, reasonNote: reasonNote.trim(), usesPerMonth: Number(uses) || 0, budget, alternative: alternative.trim(), coolingDays: cooling, coolUntil: addDays(cooling), decision: 'pending', createdAt: t, updatedAt: t });
    toast(cooling ? `已加入冷靜期清單，${cooling} 天後再看看` : '已儲存檢視紀錄');
    setItem(''); setPrice(''); setReasons([]); setReasonNote(''); setUses(''); setBudget('unsure'); setAlternative(''); setShown(false);
    setDone(true);
  };
  const decide = (e: SpendingEntry, decision: SpendingEntry['decision']) => {
    upsert('patternEntries', { ...e, decision, coolUntil: decision === 'postponed' ? addDays(e.coolingDays || 2) : e.coolUntil, updatedAt: nowIso() });
    toast(`已記錄：${decisionLabel[decision]}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="想購買的物品" required value={item} onChange={(e) => setItem(e.target.value)} placeholder="例如：新款耳機" />
        <TextField label="預估價格（元）" type="number" inputMode="numeric" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
        <TextField label="預估每月使用次數" type="number" inputMode="numeric" min={0} value={uses} onChange={(e) => setUses(e.target.value)} />
        <div>
          <label htmlFor="sp-budget" className="field-label">是否符合預算？</label>
          <select id="sp-budget" className="field" value={budget} onChange={(e) => setBudget(e.target.value as SpendingEntry['budget'])}>
            <option value="yes">符合</option>
            <option value="unsure">不確定</option>
            <option value="no">不符合</option>
          </select>
        </div>
      </div>
      <fieldset>
        <legend className="field-label">購買原因（可複選）</legend>
        <div className="flex flex-wrap gap-2">
          {spendingReasons.map((r) => (
            <button key={r.id} type="button" aria-pressed={reasons.includes(r.id)} onClick={() => setReasons((x) => (x.includes(r.id) ? x.filter((y) => y !== r.id) : [...x, r.id]))} className={reasons.includes(r.id) ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{r.label}</button>
          ))}
        </div>
      </fieldset>
      <TextField label="其他原因（選填）" value={reasonNote} onChange={(e) => setReasonNote(e.target.value)} />
      <TextField label="是否有替代方案？" value={alternative} onChange={(e) => setAlternative(e.target.value)} placeholder="例如：先用舊的、借用、買二手" />
      <button className="btn-secondary" type="button" onClick={() => setShown(true)} disabled={!item.trim()}>產生反思結果</button>

      {shown && item.trim() && (
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed motion-safe:animate-fade-up" aria-live="polite">
          <p className="font-serif text-lg font-bold">關於「{item}」的反思</p>
          <div><p className="font-medium text-accent">實際需求</p><p>{ref.need}</p></div>
          <div><p className="font-medium text-accent">社會比較因素</p><p>{ref.social}</p></div>
          <div><p className="font-medium text-accent">可能的長期成本</p><p>{ref.longTerm}</p></div>
          <div><p className="font-medium text-accent">可選擇的下一步</p><ul>{ref.next.map((n) => <li key={n}>・{n}</li>)}</ul></div>
          <p className="text-xs text-muted">這些只是整理你輸入的資訊，不代表購買是對或錯；最後的決定由你做。</p>
          <div className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
            <div>
              <label htmlFor="sp-cool" className="field-label">自訂冷靜期</label>
              <select id="sp-cool" className="field" value={cooling} onChange={(e) => setCooling(Number(e.target.value))}>
                <option value={0}>不需要冷靜期</option>
                <option value={1}>1 天</option>
                <option value={2}>2 天（48 小時）</option>
                <option value={7}>7 天</option>
                <option value={30}>30 天</option>
              </select>
            </div>
            <button className="btn-primary" onClick={save}>儲存檢視紀錄</button>
          </div>
        </div>
      )}
      {done && <PracticeAffirmation ids={affirmationIds} onClose={() => setDone(false)} />}

      {list.length > 0 && (
        <div>
          <p className="font-serif font-bold">冷靜期清單與紀錄</p>
          <ul className="mt-2 space-y-2">
            {list.map((e) => {
              const ready = e.decision === 'pending' || e.decision === 'postponed' ? e.coolUntil <= today : false;
              return (
                <EntryCard key={e.id} title={`${e.item}${e.price ? `｜${e.price.toLocaleString()} 元` : ''}`} at={e.updatedAt} actions={<DeleteButton collection="patternEntries" id={e.id} label="消費檢視紀錄" />}>
                  <p>狀態：<span className="chip">{decisionLabel[e.decision]}</span>{(e.decision === 'pending' || e.decision === 'postponed') && <span className="ml-2 text-muted">{ready ? '冷靜期已結束，可以再評估一次。' : `冷靜期到 ${formatDate(e.coolUntil)}`}</span>}</p>
                  {e.reasons.length > 0 && <p className="text-muted">原因：{e.reasons.map((r) => spendingReasons.find((x) => x.id === r)?.label).filter(Boolean).join('、')}</p>}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button className="btn-ghost btn-sm" onClick={() => decide(e, 'bought')}>決定購買</button>
                    <button className="btn-ghost btn-sm" onClick={() => decide(e, 'skipped')}>決定不買</button>
                    <button className="btn-ghost btn-sm" onClick={() => decide(e, 'postponed')}>再延後</button>
                  </div>
                </EntryCard>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
