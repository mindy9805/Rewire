/** 手機底部固定導覽 */
import { NavLink } from 'react-router-dom';
import { bottomNav } from './nav';

export default function BottomNav() {
  return (
    <nav aria-label="主要功能" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {bottomNav.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => `flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 text-[11px] ${isActive ? 'text-accent' : 'text-muted'}`}
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" aria-hidden strokeWidth={isActive ? 2.4 : 1.8} />
                  <span className="max-w-full truncate px-1">{label.replace('深度', '').replace('知識', '')}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
