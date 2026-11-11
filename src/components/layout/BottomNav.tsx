/** 手機底部固定導覽：今天／學習／每日練習／我的。子頁面會亮起所屬分組（例如在章節頁時「學習」亮起）。 */
import { Link, useLocation } from 'react-router-dom';
import { activeBottom, bottomNav } from './nav';

export default function BottomNav() {
  const { pathname } = useLocation();
  const current = activeBottom(pathname);
  return (
    <nav aria-label="主要功能" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-4">
        {bottomNav.map(({ to, label, icon: Icon }) => {
          const isActive = current === to;
          return (
            <li key={to}>
              <Link to={to} aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 text-xs transition active:scale-95 ${isActive ? 'font-medium text-accent' : 'text-muted'}`}>
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} aria-hidden strokeWidth={isActive ? 2.4 : 1.8} />
                <span className="max-w-full truncate px-1">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
