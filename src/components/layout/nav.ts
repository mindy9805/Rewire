/**
 * 主要頁面導覽設定（側邊欄、手機抽屜與底部導覽共用）
 * 依使用者的任務分成三組：今天（現在就能做的事）／學習（四大系統、工具與計畫）／我的（自己的紀錄與設定）。
 * label 是全站統一名稱（名稱對照表見 content/systems.ts），頁面標題與按鈕請使用相同名稱。
 */
import { Gamepad2, BookOpen, FlaskConical, CalendarCheck, NotebookPen, LayoutDashboard, Library, Home, Sparkles, Database, ShieldCheck, Compass, GraduationCap, UserRound, History, type LucideIcon } from 'lucide-react';

export type NavGroup = '今天' | '學習' | '我的';

export interface NavItem {
  to: string;
  label: string;
  en: string;
  icon: LucideIcon;
  group: NavGroup;
}

export const mainNav: NavItem[] = [
  { to: '/', label: '今天', en: 'Today', icon: Home, group: '今天' },
  { to: '/play', label: '輕鬆探索', en: 'Play', icon: Gamepad2, group: '今天' },
  { to: '/learn', label: '深度導讀', en: 'Learn', icon: BookOpen, group: '學習' },
  { to: '/daily', label: '每日心智練習', en: 'Daily Rewire', icon: Sparkles, group: '學習' },
  { to: '/pattern', label: '打破慣性', en: 'Break the Pattern', icon: ShieldCheck, group: '學習' },
  { to: '/habits7', label: '7 Habits 高效能生活', en: '7 Habits', icon: Compass, group: '學習' },
  { to: '/lab', label: '知識實驗室', en: 'Brain Lab', icon: FlaskConical, group: '學習' },
  { to: '/plans', label: '我的計畫', en: 'My Plans', icon: CalendarCheck, group: '學習' },
  { to: '/references', label: '研究來源', en: 'References', icon: Library, group: '學習' },
  { to: '/records', label: '我的紀錄', en: 'Records', icon: History, group: '我的' },
  { to: '/journal', label: '反思日誌', en: 'Journal', icon: NotebookPen, group: '我的' },
  { to: '/dashboard', label: '學習儀表板', en: 'Dashboard', icon: LayoutDashboard, group: '我的' },
  { to: '/data', label: '資料與隱私', en: 'Data', icon: Database, group: '我的' },
];

export const NAV_GROUPS: NavGroup[] = ['今天', '學習', '我的'];
/** 每一組的總覽頁（側邊欄分組標題可點；手機底部導覽使用） */
export const GROUP_HUB: Partial<Record<NavGroup, string>> = { 學習: '/learning', 我的: '/me' };

/** 手機底部導覽：今天／學習／每日練習／我的（四個入口，最常用的每日練習單獨放出來） */
export const bottomNav: { to: string; label: string; icon: LucideIcon; match: string[] }[] = [
  { to: '/', label: '今天', icon: Home, match: ['/', '/play'] },
  { to: '/learning', label: '學習', icon: GraduationCap, match: ['/learning', '/learn', '/pattern', '/habits7', '/lab', '/plans', '/challenge', '/references'] },
  { to: '/daily', label: '每日練習', icon: Sparkles, match: ['/daily'] },
  { to: '/me', label: '我的', icon: UserRound, match: ['/me', '/records', '/journal', '/dashboard', '/data'] },
];

/** 目前路徑屬於底部導覽的哪一項（子頁面也會亮起對應的分組） */
export function activeBottom(pathname: string) {
  const hit = (m: string) => (m === '/' ? pathname === '/' : pathname === m || pathname.startsWith(m + '/'));
  return bottomNav.find((b) => b.match.some(hit))?.to ?? null;
}
