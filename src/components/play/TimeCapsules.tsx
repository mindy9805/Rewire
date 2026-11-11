/**
 * Time Capsule｜時光膠囊
 * 寫一句話給未來的自己，自訂開啟日期；封存前可編輯；到期後可開啟回顧；可匯出、刪除。
 * ⚠️ 本站沒有後端推播：只會在你打開網站時，提示有膠囊可以開啟。
 */
import { useState } from 'react';
import { Download, Lock, MailOpen, Pencil } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { TextArea, TextField } from '../ui/basics';
import { DeleteButton } from '../pattern/EntryList';
import { nowIso, uid } from '../../lib/id';
import { formatDate, toDateKey } from '../../lib/date';
import { downloadText } from '../../lib/clipboard';
import type { TimeCapsule } from '../../types';

const plus = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return toDateKey(d); };
const PRESETS = [{ label: '2 週後', d: 14 }, { label: '1 個月後', d: 30 }, { label: '3 個月後', d: 90 }, { label: '半年後', d: 182 }];

export function readyCapsules(list: TimeCapsule[], today = toDateKey()) {
  return list.filter((c) => c.sealed && !c.openedAt && c.openOn <= today);
}

export default function TimeCapsules() {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [msg, setMsg] = useState('');
  const [openOn, setOpenOn] = useState(plus(30));
  const [editing, setEditing] = useState<TimeCapsule | null>(null);
  const today = toDateKey();
  const list = [...data.capsules].sort((a, b) => a.openOn.localeCompare(b.openOn));

  const save = (seal: boolean) => {
    if (!msg.trim() || openOn <= today) return;
    const t = nowIso();
    upsert('capsules', editing ? { ...editing, message: msg.trim(), openOn, sealed: seal, updatedAt: t } : { id: uid(), message: msg.trim(), openOn, sealed: seal, openedAt: '', createdAt: t, updatedAt: t });
    toast(seal ? `已封存，${formatDate(openOn)} 之後可以開啟 ✉️` : '已儲存草稿，封存前都可以修改');
    setMsg(''); setEditing(null); setOpenOn(plus(30));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <TextArea label={editing ? '編輯膠囊（封存前可修改）' : '寫一句話給未來的自己'} rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="一句就好。例如：希望那時候的你，有好好睡覺。" />
        <div className="flex flex-wrap items-end gap-2">
          <TextField label="開啟日期" type="date" min={plus(1)} value={openOn} onChange={(e) => setOpenOn(e.target.value)} />
          {PRESETS.map((p) => <button key={p.d} type="button" className="btn-ghost btn-sm" onClick={() => setOpenOn(plus(p.d))}>{p.label}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => save(true)} disabled={!msg.trim() || openOn <= today}><Lock className="h-4 w-4" aria-hidden />封存膠囊</button>
          <button className="btn-secondary" onClick={() => save(false)} disabled={!msg.trim() || openOn <= today}>先存草稿</button>
          {editing && <button className="btn-ghost" onClick={() => { setEditing(null); setMsg(''); }}>取消編輯</button>}
        </div>
        <p className="text-xs text-muted">本站沒有伺服器，無法在你沒打開網站時通知你；到期後，下次打開網站就會看到可以開啟的膠囊。</p>
      </div>

      {list.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold">我的膠囊（{list.length}）</h3>
            <button className="btn-ghost btn-sm ml-auto" onClick={() => { downloadText(`rewire-capsules-${today}.md`, ['# 時光膠囊', '', ...list.map((c) => `- ${formatDate(c.createdAt.slice(0, 10))} 寫下 → ${formatDate(c.openOn)} 開啟${c.openedAt ? `（已開啟）：${c.message}` : c.sealed ? '（封存中）' : `（草稿）：${c.message}`}`)].join('\n'), 'text/markdown'); toast('已匯出膠囊紀錄'); }}><Download className="h-4 w-4" aria-hidden />匯出</button>
          </div>
          <p className="text-xs text-muted">匯出時，尚未到期的封存內容不會顯示，保留開啟時的驚喜。</p>
          <ul className="mt-3 space-y-2">
            {list.map((c) => {
              const ready = c.sealed && !c.openedAt && c.openOn <= today;
              return (
                <li key={c.id} className={`rounded-2xl border p-4 text-sm ${ready ? 'border-accent bg-soft/60' : 'border-line bg-surface'}`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-muted">寫於 {formatDate(c.createdAt.slice(0, 10))}・開啟日 {formatDate(c.openOn)}</p>
                      {c.openedAt || !c.sealed ? <p className="mt-1 whitespace-pre-line font-serif text-base">{c.message}</p> : <p className="mt-1 text-muted">{ready ? '✉️ 這個膠囊可以打開了！' : `🔒 封存中，還有 ${Math.ceil((new Date(c.openOn).getTime() - new Date(today).getTime()) / 86400000)} 天`}</p>}
                      {!c.sealed && <span className="chip mt-1">草稿</span>}
                    </div>
                    {ready && <button className="btn-primary btn-sm" onClick={() => { upsert('capsules', { ...c, openedAt: nowIso(), updatedAt: nowIso() }); toast('打開了一個來自過去的訊息 💌'); }}><MailOpen className="h-4 w-4" aria-hidden />打開</button>}
                    {!c.sealed && <button className="icon-btn h-9 w-9" aria-label="編輯膠囊" onClick={() => { setEditing(c); setMsg(c.message); setOpenOn(c.openOn); }}><Pencil className="h-4 w-4" aria-hidden /></button>}
                    <DeleteButton collection="capsules" id={c.id} label="時光膠囊" />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
