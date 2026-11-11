/**
 * 工具四：完整心智預演
 * 情境預演表單（理想情境、可能障礙、應對策略、第一個真實行動），存入 rehearsals。
 */
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { TextArea, TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import { formatDateTime } from '../../lib/date';

const blank = { scenario: '', ideal: '', obstacles: '', strategy: '', firstAction: '' };

export default function RehearsalTool() {
  const [f, setF] = useState(blank);
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    upsert('rehearsals', { id: uid(), ...f, createdAt: nowIso() });
    toast('已儲存預演，記得安排真實行動！');
    setF(blank);
  };
  return (
    <div className="space-y-5">
      <form onSubmit={save} className="grid gap-3">
        <TextField label="要預演的情境" required value={f.scenario} onChange={set('scenario')} placeholder="例如：下週二向主管提出調整工作量" />
        <TextArea label="理想情境：你希望事情怎麼進行？" rows={2} value={f.ideal} onChange={set('ideal')} />
        <TextArea label="可能障礙：什麼可能讓事情不順利？（外在與內在）" rows={2} value={f.obstacles} onChange={set('obstacles')} placeholder="例如：主管很忙、我一緊張就說不清楚" />
        <TextArea label="具體應對策略：遇到障礙時你會怎麼做？" rows={2} value={f.strategy} onChange={set('strategy')} placeholder="例如：先約 15 分鐘時間；準備三個重點小卡" />
        <TextField label="第一個真實行動（心智預演需搭配實際行動）" value={f.firstAction} onChange={set('firstAction')} placeholder="例如：今天下班前寄邀請" />
        <button className="btn-primary justify-self-start" type="submit" disabled={!f.scenario.trim()}>儲存預演</button>
      </form>
      {data.rehearsals.length > 0 && (
        <ul className="space-y-2">
          {data.rehearsals.map((r) => (
            <li key={r.id} className="flex gap-2 rounded-2xl border border-line bg-surface p-4 text-sm">
              <div className="flex-1 space-y-1">
                <p className="font-medium">{r.scenario}</p>
                {r.ideal && <p><span className="text-muted">理想：</span>{r.ideal}</p>}
                {r.obstacles && <p><span className="text-muted">障礙：</span>{r.obstacles}</p>}
                {r.strategy && <p><span className="text-muted">策略：</span>{r.strategy}</p>}
                {r.firstAction && <p><span className="text-muted">第一步：</span>{r.firstAction}</p>}
                <p className="text-xs text-muted">{formatDateTime(r.createdAt)}</p>
              </div>
              <button className="icon-btn" aria-label="刪除這筆預演" onClick={async () => { if (await confirm({ title: '刪除這筆預演？', confirmText: '刪除', danger: true })) { remove('rehearsals', r.id); toast('已刪除'); } }}><Trash2 className="h-4 w-4" aria-hidden /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
