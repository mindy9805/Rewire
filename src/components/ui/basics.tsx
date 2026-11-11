/**
 * 常用基礎 UI 元件：卡片、區塊標題、空狀態、表單欄位、標籤輸入、進度條。
 * 統一樣式，並內建無障礙屬性（label 關聯、aria 進度值等）。
 */
import { useId, useState, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Inbox, X } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6 ${className}`}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, desc, id }: { eyebrow?: string; title: string; desc?: ReactNode; id?: string }) {
  return (
    <div className="mb-5">
      {eyebrow && <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
      <h2 id={id} className="mt-1 font-serif text-xl font-bold leading-snug text-ink sm:text-2xl">
        {title}
      </h2>
      {desc && <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted sm:text-base">{desc}</p>}
    </div>
  );
}

export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-soft/40 px-6 py-10 text-center">
      <Inbox className="h-8 w-8 text-sage" aria-hidden />
      <p className="mt-3 font-medium text-ink">{title}</p>
      {desc && <p className="mt-1 max-w-sm text-sm text-muted">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

type FieldProps = { label: string; hint?: string; required?: boolean };

export function TextField({ label, hint, required, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input id={id} required={required} aria-describedby={hint ? `${id}-hint` : undefined} className="field" {...rest} />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextArea({ label, hint, required, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <textarea
        id={id}
        rows={3}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="field min-h-[5.5rem] resize-y"
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

/** 標籤輸入：輸入後按 Enter 或逗號加入 */
export function TagInput({ value, onChange, label = '自訂標籤' }: { value: string[]; onChange: (v: string[]) => void; label?: string }) {
  const id = useId();
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim().replace(/^#/, '');
    if (t && !value.includes(t)) onChange([...value, t]);
    setText('');
  };
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-bg px-2 py-1.5 focus-within:ring-2 focus-within:ring-accent">
        {value.map((t) => (
          <span key={t} className="chip">
            #{t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`移除標籤 ${t}`} className="ml-1 rounded-full hover:text-accent">
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ',' || e.key === '，') && !e.nativeEvent.isComposing) {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          placeholder={value.length ? '' : '輸入後按 Enter，例如：拖延'}
          className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none"
        />
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span>
          {value}/{max}（{pct}%）
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-soft" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** 「概念示意」等提醒標籤 */
export function Disclaimer({ children }: { children: ReactNode }) {
  return <p className="mt-3 rounded-xl bg-apricot/30 px-3 py-2 text-xs leading-relaxed text-ink">⚠︎ {children}</p>;
}

/** 情緒分數選擇（1–5） */
export const MOODS = [
  { v: 1, emoji: '😣', label: '很低落' },
  { v: 2, emoji: '😕', label: '有點低' },
  { v: 3, emoji: '😐', label: '普通' },
  { v: 4, emoji: '🙂', label: '還不錯' },
  { v: 5, emoji: '😊', label: '很好' },
];

export function MoodPicker({ value, onChange, label = '情緒狀態' }: { value: number; onChange: (v: number) => void; label?: string }) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m.v}
            type="button"
            aria-pressed={value === m.v}
            onClick={() => onChange(value === m.v ? 0 : m.v)}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition ${
              value === m.v ? 'border-accent bg-accent text-onaccent' : 'border-line bg-bg hover:border-accent'
            }`}
          >
            <span aria-hidden>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
