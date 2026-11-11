/**
 * 7 Habits 共用元件：習慣圖示、來源類型標籤、三階段學習地圖、跨模組推薦
 */
import { Link } from 'react-router-dom';
import { Compass, Target, ListTodo, Handshake, MessagesSquare, Network, RefreshCcw, ArrowRight, type LucideIcon } from 'lucide-react';
import { H7_STAGES, h7Map, recommendFor, recommendationRules, SOURCE_TYPES, type H7Habit, type SourceType } from '../../content/habits7';
import { patternMap } from '../../content/breakPattern';
import { useStore } from '../../store/AppStore';
import { h7Status } from '../../lib/habits7';

export const H7_ICONS: Record<H7Habit['icon'], LucideIcon> = {
  compass: Compass, target: Target, listTodo: ListTodo, handshake: Handshake, messages: MessagesSquare, network: Network, refresh: RefreshCcw,
};

export function H7Icon({ h, className = 'h-5 w-5' }: { h: H7Habit; className?: string }) {
  const Icon = H7_ICONS[h.icon];
  return <Icon className={className} aria-hidden />;
}

const SOURCE_TONE: Record<SourceType, string> = {
  covey: 'bg-forest text-[#FAF8F4]',
  psych: 'bg-sage/40 text-ink',
  neuro: 'bg-[#9FB3C8]/50 text-ink',
  tool: 'bg-apricot/60 text-ink',
};
export function SourceBadge({ type }: { type: SourceType }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${SOURCE_TONE[type]}`} title={SOURCE_TYPES[type].desc}>{SOURCE_TYPES[type].label}</span>;
}

export function SourceLegend() {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {(Object.keys(SOURCE_TYPES) as SourceType[]).map((t) => (
        <li key={t} className="flex items-start gap-2 text-xs leading-relaxed"><SourceBadge type={t} /><span className="text-muted">{SOURCE_TYPES[t].desc}</span></li>
      ))}
    </ul>
  );
}

const STATUS_TONE = { 未開始: 'border-line text-muted', 學習中: 'border-apricot bg-apricot/30 text-ink', 已完成: 'border-accent bg-accent text-onaccent' } as const;
export function StatusChip({ status }: { status: keyof typeof STATUS_TONE }) {
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${STATUS_TONE[status]}`}>{status}</span>;
}

/** 三階段學習地圖：個人成功 → 公眾成功 → 自我更新（自我更新環繞前兩階段） */
export function StageMap() {
  const { data } = useStore();
  return (
    <div className="relative rounded-3xl border border-line bg-surface p-4 sm:p-6" role="group" aria-label="三階段學習地圖">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        {H7_STAGES.slice(0, 2).map((s, i) => (
          <div key={s.id} className={`flex flex-col rounded-2xl p-4 ${i === 0 ? 'bg-soft/70 md:col-start-1' : 'bg-apricot/25 md:col-start-3'}`}>
            <p className="font-display text-xs italic text-accent">{s.en}</p>
            <p className="font-serif text-lg font-bold">{s.title}</p>
            <p className="text-xs text-muted">從「{s.from}」走向「{s.to}」・{s.goal}</p>
            <ol className="mt-3 space-y-1.5">
              {s.habits.map((id) => {
                const h = h7Map[id];
                return (
                  <li key={id}>
                    <Link to={`/habits7/${id}`} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm shadow-sm transition hover:-translate-y-0.5">
                      <H7Icon h={h} className="h-4 w-4 text-accent" />
                      <span className="flex-1">習慣{'一二三四五六七'[h.no - 1]}：{h.title}</span>
                      <StatusChip status={h7Status(data, id)} />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
        <div className="hidden items-center justify-center md:col-start-2 md:row-start-1 md:flex" aria-hidden><ArrowRight className="h-8 w-8 text-sage" /></div>
      </div>
      <div className="mt-3 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-sage p-4 text-center">
        <p className="font-display text-xs italic text-accent">{H7_STAGES[2].en}・環繞並支持前兩個階段</p>
        <Link to="/habits7/renew" className="flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-sm shadow-sm">
          <H7Icon h={h7Map.renew} className="h-4 w-4 text-accent" />習慣七：{h7Map.renew.title}<StatusChip status={h7Status(data, 'renew')} />
        </Link>
        <p className="text-xs text-muted">{H7_STAGES[2].goal}</p>
      </div>
    </div>
  );
}

/** 依 Break the Pattern 的焦點習慣推薦 7 Habits 章節；並可展開完整規則表 */
export function Recommendations() {
  const { data } = useStore();
  const { rules } = recommendFor(data.patternFocus);
  return (
    <section aria-labelledby="rec-h" className="rounded-2xl bg-soft/50 p-4 sm:p-5">
      <h2 id="rec-h" className="font-serif text-lg font-bold">為你推薦</h2>
      {rules.length === 0 ? (
        <p className="mt-1 text-sm text-muted">在「<Link to="/pattern" className="underline">打破慣性</Link>」選擇你想調整的習慣後，這裡會依照下方公開的規則推薦相關章節與練習。</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {rules.map((r) => (
            <li key={r.patternId} className="rounded-xl bg-surface p-3 text-sm">
              <p className="text-xs text-muted">因為你選擇了「{patternMap[r.patternId].short}」：{r.reason}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.habits.map((id) => <Link key={id} to={`/habits7/${id}`} className="chip hover:bg-sage/40">7 Habits：{h7Map[id].title}</Link>)}
                {r.practices.map((p) => <Link key={p.to} to={p.to} className="chip hover:bg-sage/40">{p.label}</Link>)}
              </div>
            </li>
          ))}
        </ul>
      )}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-accent">查看完整推薦規則</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-xs">
            <caption className="sr-only">跨模組推薦規則</caption>
            <thead className="text-muted"><tr><th scope="col" className="py-1">如果你選擇（Break the Pattern）</th><th scope="col">推薦的 7 Habits 章節</th><th scope="col">推薦練習</th></tr></thead>
            <tbody>
              {recommendationRules.map((r) => (
                <tr key={r.patternId} className="border-t border-line align-top"><th scope="row" className="py-1.5 font-normal">{patternMap[r.patternId].short}</th><td>{r.habits.map((id) => h7Map[id].title).join('、')}</td><td>{r.practices.map((p) => p.label).join('、')}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-muted">規則由本站依各習慣的主題人工設定，未經研究驗證，僅供參考。</p>
        </div>
      </details>
    </section>
  );
}
