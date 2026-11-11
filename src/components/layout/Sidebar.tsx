/** 桌機左側固定導覽 */
import NavLists from './NavLists';

export default function Sidebar() {
  return (
    <aside className="sticky top-[4.125rem] hidden h-[calc(100vh-4.125rem)] w-64 shrink-0 overflow-y-auto border-r border-line/70 px-3 py-6 lg:block">
      <NavLists />
    </aside>
  );
}
