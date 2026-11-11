/**
 * Mini Quest｜今日輕冒險
 * 選分類（或隨機）→ 選深度（30 秒／2 分鐘／5 分鐘）→ 完成或換一個。心得選填，可直接跳過。
 * 不設連續完成要求，也沒有失敗懲罰。完成紀錄會累積到心智花園。
 */
import { useState } from 'react';
import { Check, Shuffle, SkipForward } from 'lucide-react';
import { DEPTH_LABEL, QUEST_CATEGORIES, quests, type Quest, type QuestCategory, type QuestDepth } from '../../content/play';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { nowIso, uid } from '../../lib/id';
import { toDateKey } from '../../lib/date';
import Buddy from './Buddy';

export function randomQuest(category?: QuestCategory, exceptId?: string): Quest {
  const pool = quests.filter((q) => (!category || q.category === category) && q.id !== exceptId);
  return pool[Math.floor(Math.random() * pool.length)] ?? quests[0];
}

export default function QuestPicker({ initial }: { initial?: Quest }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [category, setCategory] = useState<QuestCategory | ''>(initial?.category ?? '');
  const [quest, setQuest] = useState<Quest | null>(initial ?? null);
  const [depth, setDepth] = useState<QuestDepth>('short');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const todayCount = data.questLogs.filter((q) => q.date === toDateKey()).length;

  const pick = (c: QuestCategory | '') => { setCategory(c); setQuest(randomQuest(c || undefined)); setDone(false); };
  const complete = () => {
    if (!quest) return;
    upsert('questLogs', { id: uid(), questId: quest.id, depth, date: toDateKey(), note: note.trim(), createdAt: nowIso() });
    setNote('');
    setDone(true);
    toast('完成了一次小冒險 🌱');
  };

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="field-label">今天想往哪個方向走走？</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {QUEST_CATEGORIES.map((c) => (
            <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => pick(c.id)} className={`rounded-2xl border p-3 text-left transition ${category === c.id ? 'border-accent bg-soft' : 'border-line bg-surface hover:border-accent/50'}`}>
              <span className="text-xl" aria-hidden>{c.emoji}</span>
              <span className="block font-medium">{c.label}</span>
              <span className="block text-xs text-muted">{c.desc}</span>
            </button>
          ))}
        </div>
        <button className="btn-ghost btn-sm mt-2" onClick={() => pick('')}><Shuffle className="h-4 w-4" aria-hidden />幫我隨機選一個</button>
      </fieldset>

      {quest && !done && (
        <div className="rounded-3xl border border-accent/40 bg-surface p-5 motion-safe:animate-pop" aria-live="polite">
          <p className="text-xs text-muted">{QUEST_CATEGORIES.find((c) => c.id === quest.category)?.label}</p>
          <h3 className="font-serif text-xl font-bold">{quest.title}</h3>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="冒險深度">
            {(Object.keys(DEPTH_LABEL) as QuestDepth[]).map((d) => (
              <button key={d} role="radio" aria-checked={depth === d} onClick={() => setDepth(d)} className={depth === d ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{DEPTH_LABEL[d]}</button>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-soft/70 p-4 text-lg leading-relaxed">{quest.depths[depth]}</p>
          <label htmlFor="quest-note" className="mt-3 block text-sm text-muted">想留一句心得嗎？（選填）</label>
          <input id="quest-note" className="field mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：窗外有一隻鳥" />
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={complete}><Check className="h-4 w-4" aria-hidden />我完成了這次小冒險</button>
            <button className="btn-secondary" onClick={() => setQuest(randomQuest(category || undefined, quest.id))}><Shuffle className="h-4 w-4" aria-hidden />換一個冒險</button>
            <button className="btn-ghost" onClick={() => { setQuest(null); toast('沒關係，想做的時候再來', 'info'); }}><SkipForward className="h-4 w-4" aria-hidden />今天先跳過</button>
          </div>
        </div>
      )}
      {done && (
        <div className="space-y-3 motion-safe:animate-pop">
          <Buddy mood="celebrating" />
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary btn-sm" onClick={() => { setQuest(randomQuest(category || undefined, quest?.id)); setDone(false); }}>再來一個</button>
            <button className="btn-ghost btn-sm" onClick={() => { setQuest(null); setDone(false); }}>今天這樣就很好</button>
          </div>
        </div>
      )}
      {todayCount > 0 && <p className="text-xs text-muted">今天已完成 {todayCount} 次小冒險。做多少都可以，沒有每日目標。</p>}
    </div>
  );
}
