/**
 * 首頁「Daily Rewire」區塊：標題、今日狀態、開始練習按鈕、七張語句卡片、複製全部
 */
import { Link } from 'react-router-dom';
import { Play, Copy, CheckCircle2 } from 'lucide-react';
import { affirmations, DAILY_SUBTITLE, DAILY_TITLE } from '../../content/dailyRewire';
import AffirmationCard from './AffirmationCard';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { copyText } from '../../lib/clipboard';
import { allAffirmationsText } from '../../lib/daily';
import { toDateKey } from '../../lib/date';

export default function DailyRewireSection({ showAll = true }: { showAll?: boolean }) {
  const { data } = useStore();
  const toast = useToast();
  const todayDone = data.dailyLogs.some((l) => l.date === toDateKey() && l.completedReading);

  return (
    <section aria-labelledby="daily-title" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-soft via-bg to-apricot/30 p-5 sm:p-8">
      <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">Daily Rewire · 每日心智練習</p>
      <h2 id="daily-title" className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{DAILY_TITLE}</h2>
      <p className="mt-2 max-w-2xl text-muted">{DAILY_SUBTITLE}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link to="/daily/read" className="btn-primary">
          <Play className="h-4 w-4" aria-hidden /> 開始今日練習
        </Link>
        <button className="btn-secondary" onClick={async () => toast((await copyText(allAffirmationsText())) ? '已複製全部七句話' : '複製失敗', 'info')}>
          <Copy className="h-4 w-4" aria-hidden /> 複製全部七句
        </button>
        {todayDone && (
          <span className="flex items-center gap-1 text-sm text-accent">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> 今天已完成練習
          </span>
        )}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(showAll ? affirmations : affirmations.slice(0, 4)).map((a) => (
          <AffirmationCard key={a.id} a={a} compact />
        ))}
      </div>
      {!showAll && (
        <Link to="/daily" className="mt-4 inline-block text-sm text-accent underline">
          查看全部七句與練習紀錄 →
        </Link>
      )}
    </section>
  );
}
