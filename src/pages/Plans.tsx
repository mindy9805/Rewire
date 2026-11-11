/**
 * 我的計畫：把三個多天計畫（14 天練習、14 天打破慣性挑戰、21 天七習慣探索計畫）集中在一頁。
 * - 有進行中的計畫時，只突顯「一個」：最近有紀錄的那一個，並給「繼續第 N 天」的主要按鈕。
 * - 其他計畫列在下方，可隨時開始或切換；三個計畫的進度仍各自保存，互不影響。
 * - 沒有連續天數、沒有期限，中斷後隨時可以回來。
 */
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, CheckCircle2, PauseCircle } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { ProgressBar, SectionTitle } from '../components/ui/basics';
import { activePlan, planSummaries, type PlanSummary } from '../lib/plans';

const STATUS_LABEL: Record<PlanSummary['status'], string> = { none: '尚未開始', active: '進行中', paused: '暫停中', done: '已完成' };

function PlanRow({ p }: { p: PlanSummary }) {
  const action = p.status === 'none' ? '開始' : p.status === 'done' ? '回顧' : '繼續';
  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-serif text-lg font-bold">{p.title}</p>
          <p className="text-sm text-muted">{p.desc}</p>
          {p.note && <p className="mt-1 text-xs text-accent">{p.note}</p>}
        </div>
        <span className="chip shrink-0">{p.status === 'paused' && <PauseCircle className="mr-1 h-3 w-3" aria-hidden />}{p.status === 'done' && <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden />}{STATUS_LABEL[p.status]}</span>
      </div>
      {p.status !== 'none' && <div className="mt-3"><ProgressBar label={`${p.title}進度`} value={p.done} max={p.total} /></div>}
      <Link to={p.to} className="btn-secondary btn-sm mt-3">{action}「{p.title}」<ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
    </li>
  );
}

export default function Plans() {
  const { data } = useStore();
  const all = planSummaries(data);
  const current = activePlan(data);
  const others = all.filter((p) => p.id !== current?.id);
  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <SectionTitle eyebrow="My Plans" title="我的計畫" desc="把學到的東西變成每天的小行動。一次專心一個計畫就好；不需要連續，中斷後隨時可以回來。" />

      {current ? (
        <section aria-labelledby="current-plan" className="rounded-3xl bg-forest p-5 text-[#FAF8F4] sm:p-8">
          <p className="flex items-center gap-2 text-sm text-[#E8CCB2]"><CalendarCheck className="h-4 w-4" aria-hidden />目前進行中</p>
          <h2 id="current-plan" className="mt-1 font-serif text-2xl font-bold">{current.title}</h2>
          {current.note && <p className="mt-1 text-sm text-[#E9EEE7]">{current.note}</p>}
          {/* 深色卡片上的進度條（淺色字與杏色進度，維持對比） */}
          <p className="mt-4 flex justify-between text-xs text-[#E9EEE7]"><span>完成天數</span><span>{current.done}/{current.total}</span></p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-label="完成天數" aria-valuemin={0} aria-valuemax={current.total} aria-valuenow={current.done}>
            <div className="h-full rounded-full bg-[#E8CCB2] transition-all duration-500" style={{ width: `${Math.round((current.done / current.total) * 100)}%` }} />
          </div>
          <Link to={current.to} className="btn mt-5 bg-[#FAF8F4] text-[#36594B] hover:opacity-90">繼續第 {current.nextDay} 天<ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </section>
      ) : (
        <section aria-labelledby="pick-plan" className="rounded-3xl border border-line bg-soft/50 p-5 sm:p-8">
          <h2 id="pick-plan" className="font-serif text-xl font-bold">選一個計畫開始</h2>
          <p className="mt-1 text-sm text-muted">不確定選哪個？想多了解大腦，選「14 天練習」；有一個想調整的習慣，選「14 天打破慣性挑戰」；想練習價值與人際，選「21 天七習慣探索計畫」。</p>
        </section>
      )}

      <section aria-labelledby="other-plans">
        <h2 id="other-plans" className="text-lg font-bold">{current ? '其他計畫' : '三個計畫'}</h2>
        <p className="text-sm text-muted">每個計畫的進度都分開保存，切換不會遺失任何紀錄。</p>
        <ul className="mt-3 grid gap-3">{others.map((p) => <PlanRow key={p.id} p={p} />)}</ul>
      </section>
    </div>
  );
}
