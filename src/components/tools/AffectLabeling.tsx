/**
 * 工具二：情緒命名
 * 情緒輪盤（核心情緒 → 細緻詞彙）＋強度評分＋情緒日記；資料存入 emotionLogs。
 */
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { emotionWheel } from '../../content/tools';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { TextArea } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import { formatDateTime } from '../../lib/date';

export default function AffectLabeling() {
  const [core, setCore] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const group = emotionWheel.find((g) => g.core === core);

  const save = () => {
    if (!core) return;
    upsert('emotionLogs', { id: uid(), core, word: word || core, intensity, note: note.trim(), createdAt: nowIso() });
    toast(`已記錄：「${word || core}」`);
    setCore(null); setWord(''); setIntensity(5); setNote('');
  };

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="field-label">1. 先選一個大方向</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {emotionWheel.map((g) => (
            <button key={g.core} type="button" aria-pressed={core === g.core} onClick={() => { setCore(g.core); setWord(''); }}
              className={`rounded-2xl border-2 px-2 py-3 text-sm font-medium text-[#303630] transition ${core === g.core ? 'border-[#303630] scale-105' : 'border-transparent'}`}
              style={{ background: g.color }}>
              {g.core}
            </button>
          ))}
        </div>
      </fieldset>
      {group && (
        <fieldset className="motion-safe:animate-fade-up">
          <legend className="field-label">2. 哪一個詞更貼近你的感受？</legend>
          <div className="flex flex-wrap gap-2">
            {group.words.map((w) => (
              <button key={w} type="button" aria-pressed={word === w} onClick={() => setWord(w)} className={word === w ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{w}</button>
            ))}
          </div>
        </fieldset>
      )}
      {core && (
        <div className="space-y-3 motion-safe:animate-fade-up">
          <div>
            <label htmlFor="intensity" className="field-label">3. 強度：{intensity}／10</label>
            <input id="intensity" type="range" min={1} max={10} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" />
          </div>
          <TextArea label="4. 情緒日記（選填）：發生了什麼？身體有什麼感覺？" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <p className="rounded-xl bg-soft/70 px-3 py-2 text-sm">試著完整說一次：「我現在感覺到<strong>{word || core}</strong>，強度大約 {intensity} 分。」</p>
          <button className="btn-primary" onClick={save}>儲存情緒紀錄</button>
        </div>
      )}
      {data.emotionLogs.length > 0 && (
        <details className="rounded-2xl border border-line bg-surface p-4">
          <summary className="cursor-pointer font-medium">我的情緒日記（{data.emotionLogs.length}）</summary>
          <ul className="mt-3 space-y-2">
            {data.emotionLogs.slice(0, 30).map((e) => (
              <li key={e.id} className="flex items-start gap-2 rounded-xl bg-soft/50 p-3 text-sm">
                <span className="h-3 w-3 shrink-0 translate-y-1.5 rounded-full" style={{ background: emotionWheel.find((g) => g.core === e.core)?.color }} aria-hidden />
                <div className="flex-1">
                  <p><strong>{e.word}</strong>（{e.core}）· 強度 {e.intensity}</p>
                  {e.note && <p className="text-muted">{e.note}</p>}
                  <p className="text-xs text-muted">{formatDateTime(e.createdAt)}</p>
                </div>
                <button className="icon-btn" aria-label="刪除這筆情緒紀錄" onClick={async () => { if (await confirm({ title: '刪除這筆情緒紀錄？', confirmText: '刪除', danger: true })) { remove('emotionLogs', e.id); toast('已刪除'); } }}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
