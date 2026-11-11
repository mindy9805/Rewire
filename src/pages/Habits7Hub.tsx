/**
 * 7 Habits 學習總覽：核心理念、三階段學習地圖、內容來源說明、七個課程卡片（狀態）、
 * 互動工具入口、跨模組推薦、21 天探索計畫與個人實踐紀錄。
 */
import { Link } from 'react-router-dom';
import { CalendarRange, Download } from 'lucide-react';
import { H7_CORE, H7_MODULE, H7_SUBTITLE, H7_TITLE, h7Habits } from '../content/habits7';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { ProgressBar } from '../components/ui/basics';
import { H7Icon, Recommendations, SourceLegend, StageMap, StatusChip } from '../components/habits7/shared';
import { h7StageProgress, h7Status, planProgress } from '../lib/habits7';
import { downloadText } from '../lib/clipboard';
import { habits7ToMarkdown, stamp } from '../lib/exporters';

export default function Habits7Hub() {
  const { data } = useStore();
  const toast = useToast();
  const sp = h7StageProgress(data);
  const pp = planProgress(data);
  const records = [
    { label: '影響圈整理', n: data.circles.length, to: '/habits7/proactive#tool' },
    { label: '人生羅盤領域', n: Object.values(data.lifeCompass.areas).filter((a) => Object.values(a).some((v) => v.trim())).length, to: '/habits7/end#tool' },
    { label: '四象限任務', n: data.quadrantTasks.length, to: '/habits7/first#tool' },
    { label: '協商練習', n: data.negotiations.length, to: '/habits7/winwin#tool' },
    { label: '同理溝通練習', n: data.empathyLogs.length, to: '/habits7/understand#tool' },
    { label: '團隊思考板', n: data.teamBoards.length, to: '/habits7/synergize#tool' },
    { label: '四維自評週數', n: data.renewalChecks.length, to: '/habits7/renew#tool' },
  ];

  return (
    <div className="space-y-10 motion-safe:animate-fade-up">
      <header className="rounded-3xl bg-gradient-to-br from-soft via-bg to-apricot/30 p-6 sm:p-10">
        <p className="font-display text-sm italic text-accent">{H7_MODULE}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{H7_TITLE}</h1>
        <p className="mt-3 text-lg text-muted">{H7_SUBTITLE}</p>
        <div className="mt-6 space-y-2 border-l-2 border-accent pl-4 leading-relaxed">{H7_CORE.map((l) => <p key={l}>{l}</p>)}</div>
        <p className="mt-4 text-xs text-muted">理論參考：Stephen R. Covey《The 7 Habits of Highly Effective People》（繁中版《與成功有約》）。本站僅以七個習慣名稱作為概念標籤，所有解說、工具與題目皆為原創。</p>
      </header>

      <section aria-labelledby="map-h">
        <h2 id="map-h" className="mb-3 text-xl font-bold">三階段學習地圖</h2>
        <StageMap />
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {sp.stages.map((s) => <ProgressBar key={s.id} label={s.title} value={s.done} max={s.total} />)}
          <ProgressBar label="七習慣總進度" value={sp.done} max={sp.total} />
        </div>
      </section>

      <section aria-labelledby="src-h" className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <h2 id="src-h" className="font-serif text-lg font-bold">內容如何區分來源？</h2>
        <p className="mb-3 mt-1 text-sm text-muted">七個習慣是柯維提出的管理哲學與實踐框架，並未被神經科學逐一驗證。每個概念都會標示來源類型：</p>
        <SourceLegend />
      </section>

      <section aria-labelledby="courses-h">
        <h2 id="courses-h" className="mb-1 text-xl font-bold">七大習慣課程</h2>
        <p className="mb-4 text-sm text-muted">可自由選擇章節，不需要依固定順序。</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {h7Habits.map((h) => (
            <li key={h.id}>
              <Link to={`/habits7/${h.id}`} className="card-hover flex h-full flex-col rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-accent"><H7Icon h={h} /></span>
                  <span className="font-display text-sm italic text-muted">Habit {h.no}</span>
                  <span className="ml-auto"><StatusChip status={h7Status(data, h.id)} /></span>
                </div>
                <p className="mt-2 font-serif text-lg font-bold">{h.title}</p>
                <p className="text-xs text-muted">{h.en}</p>
                <p className="mt-2 text-sm">{h.core}</p>
                <p className="mt-auto pt-3 text-xs text-accent">互動工具：{h.toolTitle}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Recommendations />

      <section aria-labelledby="plan-h" className="rounded-2xl border border-accent/40 bg-surface p-5">
        <h2 id="plan-h" className="flex items-center gap-2 font-serif text-lg font-bold"><CalendarRange className="h-5 w-5 text-accent" aria-hidden />21 天七習慣探索計畫</h2>
        <p className="mt-1 text-sm text-muted">每個習慣三天：理解概念 → 行動實驗 → 反思調整。可中斷後繼續。</p>
        <div className="mt-3 max-w-md"><ProgressBar label="探索計畫進度" value={pp.done} max={pp.total} /></div>
        <Link to="/habits7/plan" className="btn-primary mt-3">{pp.started ? `繼續第 ${pp.nextDay ?? 21} 天` : '開始 21 天探索'}</Link>
      </section>

      <section aria-labelledby="rec-list-h">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="rec-list-h" className="text-xl font-bold">個人實踐紀錄</h2>
          <button className="btn-ghost btn-sm ml-auto" onClick={() => { downloadText(`rewire-7habits-${stamp()}.md`, habits7ToMarkdown(data), 'text/markdown'); toast('已匯出 7 Habits 紀錄'); }}><Download className="h-4 w-4" aria-hidden />匯出 Markdown</button>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {records.map((r) => (
            <li key={r.label}><Link to={r.to} className="block rounded-2xl bg-soft/60 p-3 text-sm hover:bg-soft"><span className="block text-xs text-muted">{r.label}</span><span className="font-display text-2xl font-bold">{r.n}</span></Link></li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">完整備份與還原請到「<Link to="/data" className="underline">資料與隱私</Link>」。</p>
      </section>
    </div>
  );
}
