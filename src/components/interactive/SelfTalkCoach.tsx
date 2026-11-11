/**
 * 自我對話轉換練習（第 4 章）
 * 五步驟引導：絕對性用語 → 支持的事實 → 不一致的事實 → 平衡陳述 → 下一步行動。
 */
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { detect } from '../../lib/rewrite';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { TextArea } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import { formatDateTime } from '../../lib/date';
import type { SelfTalkRecord } from '../../types';

const empty = { thought: '', absolutes: '', evidenceFor: '', evidenceAgainst: '', balanced: '', nextStep: '' };
const steps: { key: keyof typeof empty; q: string; hint: string }[] = [
  { key: 'thought', q: '寫下一個讓你不舒服的負面想法', hint: '例如：我每次簡報都搞砸，大家一定覺得我很沒用。' },
  { key: 'absolutes', q: '這句話有哪些絕對性用語？', hint: '系統已用規則幫你標出可能的詞，你也可以自己補充。' },
  { key: 'evidenceFor', q: '有哪些事實支持這個想法？', hint: '只寫實際發生、可觀察的事。' },
  { key: 'evidenceAgainst', q: '有哪些事實可能與它不一致？', hint: '例外、別人的回饋、過去的成功經驗。' },
  { key: 'balanced', q: '如何轉換為具體、平衡的陳述？', hint: '同時承認困難與事實，例如：「上次簡報的結尾比較匆促，但開場有同事說很清楚。」' },
  { key: 'nextStep', q: '下一步可以採取什麼行動？', hint: '一個小而具體的行動。' },
];

export default function SelfTalkCoach() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(empty);
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const cur = steps[step];
  const found = detect(form.thought).absolutes;

  const next = () => {
    if (step === 0 && !form.absolutes && found.length) setForm((f) => ({ ...f, absolutes: found.join('、') }));
    setStep((s) => Math.min(s + 1, steps.length));
  };
  const save = () => {
    const rec: SelfTalkRecord = { id: uid(), ...form, createdAt: nowIso() };
    upsert('selfTalk', rec);
    toast('已儲存這次的自我對話練習');
    setForm(empty);
    setStep(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1" aria-hidden>
        {steps.map((s, i) => <span key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-line'}`} />)}
      </div>
      {step < steps.length ? (
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <p className="text-xs text-muted">步驟 {step + 1}／{steps.length}</p>
          <TextArea label={cur.q} hint={cur.hint} value={form[cur.key]} onChange={(e) => setForm((f) => ({ ...f, [cur.key]: e.target.value }))} />
          {cur.key === 'absolutes' && found.length > 0 && (
            <p className="mt-2 text-sm">規則偵測到：{found.map((w) => <mark key={w} className="mx-0.5 rounded bg-apricot/60 px-1 text-ink">{w}</mark>)}</p>
          )}
          {cur.key === 'balanced' && form.thought && <p className="mt-2 rounded-xl bg-soft/70 px-3 py-2 text-xs">原本的想法：{form.thought}</p>}
          <div className="mt-4 flex gap-2">
            <button className="btn-secondary" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}><ArrowLeft className="h-4 w-4" aria-hidden />上一步</button>
            <button className="btn-primary" onClick={next} disabled={step === 0 && !form.thought.trim()}>{step === steps.length - 1 ? '查看整理' : '下一步'}<ArrowRight className="h-4 w-4" aria-hidden /></button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-accent/40 bg-soft/50 p-4 sm:p-5 motion-safe:animate-fade-up">
          <p className="font-serif font-bold">你的轉換整理</p>
          <dl className="mt-3 space-y-2 text-sm">
            {steps.map((s) => (
              <div key={s.key}>
                <dt className="font-medium text-accent">{s.q}</dt>
                <dd>{form[s.key] || '（未填）'}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => setStep(steps.length - 1)}>返回修改</button>
            <button className="btn-primary" onClick={save}>儲存練習</button>
          </div>
        </div>
      )}
      {data.selfTalk.length > 0 && (
        <details className="rounded-2xl border border-line bg-surface p-4">
          <summary className="cursor-pointer font-medium">過去的練習（{data.selfTalk.length}）</summary>
          <ul className="mt-3 space-y-2">
            {data.selfTalk.map((r) => (
              <li key={r.id} className="flex gap-2 rounded-xl bg-soft/50 p-3 text-sm">
                <div className="flex-1">
                  <p className="text-muted">{r.thought}</p>
                  <p className="mt-1 font-medium">→ {r.balanced || '（未填平衡陳述）'}</p>
                  {r.nextStep && <p className="text-xs">下一步：{r.nextStep}</p>}
                  <p className="text-xs text-muted">{formatDateTime(r.createdAt)}</p>
                </div>
                <button className="icon-btn" aria-label="刪除這筆練習" onClick={async () => { if (await confirm({ title: '刪除這筆練習？', confirmText: '刪除', danger: true })) { remove('selfTalk', r.id); toast('已刪除'); } }}>
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
