/**
 * 側邊欄與手機抽屜共用的導覽清單：今天／學習／我的三組，以及九個章節（含完成狀態）。
 * 章節清單只在「深度導讀」相關頁面顯示，其他頁面保持精簡；手機抽屜（showChapters）一律顯示。
 */
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { GROUP_HUB, mainNav, NAV_GROUPS } from './nav';
import { chapters } from '../../content/chapters';
import { useStore } from '../../store/AppStore';

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-soft font-medium text-accent' : 'text-ink hover:bg-soft/60'}`;

export default function NavLists({ showChapters = false }: { showChapters?: boolean }) {
  const { data } = useStore();
  const { pathname } = useLocation();
  const chaptersVisible = showChapters || pathname === '/learn' || pathname.startsWith('/learn/');
  return (
    <>
      <nav aria-label="主要頁面" className="space-y-4">
        {NAV_GROUPS.map((g) => (
          <div key={g}>
            {GROUP_HUB[g] ? (
              <Link to={GROUP_HUB[g]!} className="block rounded-lg px-3 pb-1 text-[11px] font-medium tracking-wider text-muted hover:text-accent">{g}<span className="sr-only">（總覽）</span></Link>
            ) : (
              <p className="px-3 pb-1 text-[11px] font-medium tracking-wider text-muted">{g}</p>
            )}
            <ul className="space-y-0.5">
              {mainNav.filter((n) => n.group === g).map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink to={to} end={to === '/'} className={linkCls}>
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {chaptersVisible && <nav aria-label="章節導覽" className="mt-6">
        <p className="px-3 font-display text-xs uppercase tracking-[0.2em] text-muted">Chapters</p>
        <ul className="mt-2 space-y-0.5">
          {chapters.map((c) => {
            const done = data.chapters[c.id]?.completed;
            return (
              <li key={c.id}>
                <NavLink to={`/learn/${c.id}`} className={linkCls}>
                  {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-label="已完成" /> : <Circle className="h-4 w-4 shrink-0 text-line" aria-hidden />}
                  <span className="min-w-0">
                    <span className="mr-1 text-muted">{c.number}.</span>
                    {c.title}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>}
    </>
  );
}
