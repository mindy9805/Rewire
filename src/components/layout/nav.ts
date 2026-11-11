/** 主要頁面導覽設定（側邊欄、手機抽屜與底部導覽共用） */
import { Gamepad2, BookOpen, FlaskConical, CalendarCheck, NotebookPen, LayoutDashboard, Library, Home, Sparkles, Database, ShieldCheck, Compass, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  en: string;
  icon: LucideIcon;
  /** 側邊欄分組 */
  group: '開始' | '四大學習系統' | '練習與成長' | '資料';
}

export const mainNav: NavItem[] = [
  { to: '/', label: '首頁', en: 'Overview', icon: Home, group: '開始' },
  { to: '/play', label: '輕鬆探索', en: 'Play', icon: Gamepad2, group: '開始' },
  { to: '/learn', label: '深度導讀', en: 'Learn', icon: BookOpen, group: '四大學習系統' },
  { to: '/daily', label: '每日心智練習', en: 'Daily Rewire', icon: Sparkles, group: '四大學習系統' },
  { to: '/pattern', label: '打破慣性', en: 'Break the Pattern', icon: ShieldCheck, group: '四大學習系統' },
  { to: '/habits7', label: '7 Habits｜高效能生活', en: '7 Habits', icon: Compass, group: '四大學習系統' },
  { to: '/lab', label: '知識實驗室', en: 'Brain Lab', icon: FlaskConical, group: '練習與成長' },
  { to: '/challenge', label: '14 天練習', en: 'Challenge', icon: CalendarCheck, group: '練習與成長' },
  { to: '/journal', label: '反思日誌', en: 'Journal', icon: NotebookPen, group: '練習與成長' },
  { to: '/dashboard', label: '學習儀表板', en: 'Dashboard', icon: LayoutDashboard, group: '練習與成長' },
  { to: '/references', label: '研究來源', en: 'References', icon: Library, group: '資料' },
  { to: '/data', label: '資料與隱私', en: 'Data', icon: Database, group: '資料' },
];

export const NAV_GROUPS = ['開始', '四大學習系統', '練習與成長', '資料'] as const;
const byPath = (to: string) => mainNav.find((n) => n.to === to)!;

/** 手機底部導覽：最常用的五項 */
export const bottomNav: NavItem[] = ['/', '/play', '/learn', '/challenge', '/journal'].map(byPath);
