/** 側邊欄與手機抽屜共用的導覽清單：主要頁面＋九個章節（含完成狀態） */
import { NavLink } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { mainNav, NAV_GROUPS } from './nav';
import { chapters } from '../../content/chapters';
import { useStore } from '../../store/AppStore';

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-soft font-medium text-accent' : 'text-ink hover:bg-soft/60'}`;

export default function NavLists() {
  const { data } = useStore();
  return (
    <>
      <nav aria-label="主要頁面" className="space-y-4">
        {NAV_GROUPS.map((g) => (
          <div key={g}>
            <p className="px-3 pb-1 text-[11px] font-medium tracking-wider text-muted">{g}</p>
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
      <nav aria-label="章節導覽" className="mt-6">
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
      </nav>
    </>
  );
}
