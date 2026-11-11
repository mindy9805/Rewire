/**
 * 我的紀錄：把分散在各工具的紀錄依日期集中成一條時間軸。
 * - 可依類型篩選、搜尋；每一筆都有「查看」連結回到原本的工具（資料不搬動）
 * - 一次顯示 40 筆，需要時再載入更多
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { EmptyState, SectionTitle } from '../components/ui/basics';
import { THEME_LABEL, type ActivityTheme } from '../lib/activity';
import { collectRecords } from '../lib/records';
import { formatDate } from '../lib/date';

const PAGE = 40;

export default function Records() {
  const { data } = useStore();
  const all = useMemo(() => collectRecords(data), [data]);
  const [theme, setTheme] = useState<ActivityTheme | 'all'>('all');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const themes = (Object.keys(THEME_LABEL) as ActivityTheme[]).filter((t) => all.some((r) => r.theme === t));
  const list = all.filter((r) => (theme === 'all' || r.theme === theme) && (!q.trim() || `${r.label} ${r.detail ?? ''}`.includes(q.trim())));
  const shown = list.slice(0, limit);
  // 依日期分組
  const groups: { date: string; items: typeof shown }[] = [];
  for (const r of shown) {
    const g = groups[groups.length - 1];
    if (g?.date === r.date) g.items.push(r); else groups.push({ date: r.date, items: [r] });
  }

  return (
    <div className="space-y-6 motion-safe:animate-fade-up">
      <nav aria-label="麵包屑" className="text-sm text-muted"><Link to="/me" className="hover:text-accent">我的</Link> / 我的紀錄</nav>
      <SectionTitle title="我的紀錄" desc="所有練習、測驗與書寫，依日期整理在這裡。點「查看」會回到原本的工具；紀錄仍保存在原來的位置。" />
      {all.length === 0 ? (
        <EmptyState title="還沒有任何紀錄" desc="完成任何一個練習或寫下一則反思，就會出現在這裡。" action={<Link to="/" className="btn-primary btn-sm">回到「今天」</Link>} />
      ) : (
        <>
          <div className="space-y-3">
            <div role="group" aria-label="依類型篩選" className="flex flex-wrap gap-2">
              {(['all', ...themes] as const).map((t) => (
                <button key={t} type="button" aria-pressed={theme === t} onClick={() => { setTheme(t); setLimit(PAGE); }} className="btn-toggle">
                  {t === 'all' ? '全部' : THEME_LABEL[t]}<span className="ml-1 opacity-70">{t === 'all' ? all.length : all.filter((r) => r.theme === t).length}</span>
                </button>
              ))}
            </div>
            <label className="relative block max-w-md">
              <span className="sr-only">搜尋紀錄</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input type="search" className="field pl-9" placeholder="搜尋紀錄類型，例如：測驗、日誌、第 3 天…" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} />
            </label>
            <p className="text-xs text-muted" aria-live="polite">共 {list.length} 筆</p>
          </div>
          {list.length === 0 ? <p className="rounded-xl bg-soft/60 p-4 text-sm text-muted">沒有符合的紀錄。</p> : (
            <ol className="space-y-6">
              {groups.map((g) => (
                <li key={g.date}>
                  <h2 className="mb-2 text-sm font-medium text-muted">{formatDate(g.date)}</h2>
                  <ul className="space-y-2 border-l-2 border-soft pl-4">
                    {g.items.map((r) => (
                      <li key={r.key} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
                        <span className="min-w-0 flex-1">
                          <span className="chip mr-2">{THEME_LABEL[r.theme]}</span>
                          <span className="font-medium">{r.label}</span>
                          {r.detail && <span className="block text-sm text-muted">{r.detail}</span>}
                        </span>
                        <Link to={r.to} className="btn-ghost btn-sm shrink-0" aria-label={`查看「${r.label}${r.detail ? `：${r.detail}` : ''}」`}>查看<ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
          {list.length > limit && <button type="button" className="btn-secondary btn-sm" onClick={() => setLimit((l) => l + PAGE)}>顯示更多（還有 {list.length - limit} 筆）</button>}
        </>
      )}
    </div>
  );
}
