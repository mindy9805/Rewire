/**
 * 學習（總覽）：四大學習系統，加上知識實驗室、我的計畫與研究來源。
 * 原本首頁的「自由探索」入口移到這裡，首頁因此可以更精簡。
 */
import { Link } from 'react-router-dom';
import { FlaskConical, Library, CalendarCheck, ArrowRight } from 'lucide-react';
import { SYSTEMS } from '../content/systems';
import { useStore } from '../store/AppStore';
import { SectionTitle } from '../components/ui/basics';
import { activitySummary, collectActivity } from '../lib/activity';
import { activePlan } from '../lib/plans';

export default function Learning() {
  const { data } = useStore();
  const summary = activitySummary(collectActivity(data));
  const count: Record<string, number> = { neuro: summary.byTheme.neuro ?? 0, daily: summary.byTheme.daily ?? 0, pattern: summary.byTheme.pattern ?? 0, habits7: summary.byTheme.habits7 ?? 0 };
  const plan = activePlan(data);
  const tools = [
    { to: '/lab', icon: FlaskConical, title: '知識實驗室', desc: '所有模擬器與實踐工具都在這裡，可以直接動手試。' },
    { to: '/plans', icon: CalendarCheck, title: '我的計畫', desc: plan ? `進行中：${plan.title}（${plan.done}/${plan.total}）` : '14 天練習、14 天打破慣性挑戰、21 天探索計畫。' },
    { to: '/references', icon: Library, title: '研究來源', desc: '本站引用的研究與延伸閱讀，以及科學證據檢視卡。' },
  ];
  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <SectionTitle eyebrow="Learn" title="學習" desc="四個學習系統各有不同視角，可以從任何一個開始。想先動手，就到知識實驗室；想持續練習，就選一個計畫。" />
      <section aria-labelledby="systems-h">
        <h2 id="systems-h" className="text-lg font-bold">四大學習系統</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {SYSTEMS.filter((s) => s.core).map((s) => (
            <li key={s.id}>
              <Link to={s.to} className="card-hover flex h-full flex-col rounded-2xl border border-line bg-surface p-4">
                <span className="font-display text-xs italic text-accent">{s.en}</span>
                <span className="font-serif text-lg font-bold">{s.title}</span>
                <span className="text-sm">{s.desc}</span>
                <span className="mt-2 text-xs text-muted">{s.lens}</span>
                {count[s.id] > 0 && <span className="mt-auto pt-2 text-xs text-accent">已留下 {count[s.id]} 筆紀錄</span>}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">四個系統的性質不同：深度導讀整理科學研究，每日心智練習是覺察練習，打破慣性是行為實踐框架，7 Habits 是管理哲學。頁面中會清楚標示研究結論、管理哲學與本站的實踐建議。</p>
      </section>
      <section aria-labelledby="tools-h">
        <h2 id="tools-h" className="text-lg font-bold">練習與工具</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {tools.map(({ to, icon: Icon, title, desc }) => (
            <li key={to}>
              <Link to={to} className="card-hover flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-col">
                <Icon className="h-6 w-6 shrink-0 text-accent" aria-hidden />
                <span className="min-w-0"><span className="flex items-center gap-1 font-serif font-bold">{title}<ArrowRight className="h-3.5 w-3.5 text-muted" aria-hidden /></span><span className="text-sm text-muted">{desc}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
