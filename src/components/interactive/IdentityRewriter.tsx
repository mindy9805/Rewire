/**
 * 身份敘事改寫器（第 3 章）
 * 使用本地規則與引導式表單，把抽象的身份標籤改寫為具體、可調整的描述。
 * ⚠️ 沒有串接 AI：所有建議皆由預設句型與你的回答組合而成。
 */
import { useState } from 'react';
import { Wand2, Trash2 } from 'lucide-react';
import { detect, suggestRewrites } from '../../lib/rewrite';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { TextArea, TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import { formatDateTime } from '../../lib/date';

export default function IdentityRewriter() {
  const [original, setOriginal] = useState('我就是不擅長社交。');
  const [situation, setSituation] = useState('');
  const [skill, setSkill] = useState('');
  const [evidence, setEvidence] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [final, setFinal] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const det = detect(original);

  const generate = () => {
    const s = suggestRewrites({ original, situation, skill, evidence, nextStep });
    setSuggestions(s);
    setFinal(s[0]);
  };
  const save = () => {
    upsert('identityRewrites', { id: uid(), original: original.trim(), rewritten: final.trim(), createdAt: nowIso() });
    toast('已儲存改寫');
  };

  return (
    <div className="space-y-5">
      <p className="rounded-xl bg-soft/70 px-3 py-2 text-xs">本工具使用網站內建的規則與句型提示，不是 AI，也不會把你的文字傳送到任何地方。</p>
      <TextField label="1. 寫下一句你常對自己說的身份標籤" value={original} onChange={(e) => setOriginal(e.target.value)} />
      {original.trim() && (
        <div className="rounded-xl border border-line bg-surface p-3 text-sm" aria-live="polite">
          <p className="font-medium">規則偵測結果</p>
          {det.absolutes.length > 0 && <p className="mt-1">絕對性用語：{det.absolutes.map((w) => <mark key={w} className="mx-0.5 rounded bg-apricot/60 px-1 text-ink">{w}</mark>)}</p>}
          {det.labels.map((h) => <p key={h} className="mt-1 text-muted">・{h}</p>)}
          {det.absolutes.length === 0 && det.labels.length === 0 && <p className="mt-1 text-muted">沒有偵測到明顯的標籤句型，你仍可以用下方問題讓描述更具體。</p>}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="2. 在什麼情境下，這件事對你比較困難？" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="例如：超過五個人的聚會" />
        <TextField label="3. 具體來說，你想學會的技能是？" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="例如：如何主動開啟並延續對話" />
        <TextField label="4. 有沒有一個小小的例外或進步？" value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="例如：上週和同事聊了五分鐘" />
        <TextField label="5. 下一步可以做什麼小練習？" value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="例如：準備兩個開場問題" />
      </div>
      <button className="btn-primary" onClick={generate} disabled={!original.trim()}>
        <Wand2 className="h-4 w-4" aria-hidden /> 產生改寫建議
      </button>
      {suggestions.length > 0 && (
        <div className="space-y-3 motion-safe:animate-fade-up">
          <fieldset>
            <legend className="field-label">選一個喜歡的句型（可再編輯）</legend>
            <div className="grid gap-2">
              {suggestions.map((s) => (
                <label key={s} className={`flex cursor-pointer gap-2 rounded-xl border p-3 text-sm ${final === s ? 'border-accent bg-soft' : 'border-line'}`}>
                  <input type="radio" name="rewrite" className="mt-1 accent-[rgb(var(--accent))]" checked={final === s} onChange={() => setFinal(s)} />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          <TextArea label="我的新敘事" value={final} onChange={(e) => setFinal(e.target.value)} />
          <button className="btn-primary" onClick={save} disabled={!final.trim()}>儲存改寫</button>
        </div>
      )}
      {data.identityRewrites.length > 0 && (
        <div>
          <p className="font-serif font-bold">我的改寫紀錄</p>
          <ul className="mt-2 space-y-2">
            {data.identityRewrites.map((r) => (
              <li key={r.id} className="flex gap-3 rounded-xl border border-line bg-surface p-3 text-sm">
                <div className="flex-1">
                  <p className="text-muted line-through decoration-sage">{r.original}</p>
                  <p className="mt-1 font-medium">→ {r.rewritten}</p>
                  <p className="mt-1 text-xs text-muted">{formatDateTime(r.createdAt)}</p>
                </div>
                <button className="icon-btn" aria-label="刪除這筆改寫" onClick={async () => { if (await confirm({ title: '刪除這筆改寫？', message: '刪除後無法復原。', confirmText: '刪除', danger: true })) { remove('identityRewrites', r.id); toast('已刪除'); } }}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
