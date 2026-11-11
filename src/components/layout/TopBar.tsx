/** 頂部列：品牌、搜尋、字體大小、主題切換、右側面板開關與閱讀進度條 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Monitor, PanelRightOpen, PanelRightClose, AArrowUp } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import type { FontScale, ThemeMode } from '../../types';

const fontOrder: FontScale[] = ['sm', 'md', 'lg', 'xl'];
const fontLabel: Record<FontScale, string> = { sm: '小', md: '中', lg: '大', xl: '特大' };
const themeOrder: ThemeMode[] = ['system', 'light', 'dark'];
const themeLabel: Record<ThemeMode, string> = { system: '跟隨系統', light: '淺色', dark: '深色' };

export default function TopBar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const { data, update } = useStore();
  const { theme, fontScale, rightPanelOpen } = data.settings;
  const [progress, setProgress] = useState(0);

  // 閱讀進度：依目前頁面捲動比例計算
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const setSettings = (patch: Partial<typeof data.settings>) => update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  const nextFont = fontOrder[(fontOrder.indexOf(fontScale) + 1) % fontOrder.length];
  const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length];
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/90 backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-5">
        <button className="icon-btn lg:hidden" onClick={onMenu} aria-label="開啟章節與功能選單">
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <Link to="/" className="flex min-w-0 items-center gap-2 rounded-lg" aria-label="Rewire 首頁">
          <img src="./icon.svg" alt="" className="h-8 w-8 shrink-0" />
          <span className="truncate font-display text-lg font-bold text-forest">Rewire</span>
          <span className="hidden truncate font-serif text-sm text-muted sm:inline">｜重塑大腦的可能</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onSearch}
            className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm text-muted hover:border-accent md:w-56"
            aria-label="搜尋全站內容（快捷鍵 /）"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline">搜尋章節、筆記…</span>
            <kbd className="ml-auto hidden rounded border border-line px-1.5 text-[10px] md:inline">/</kbd>
          </button>
          <button className="icon-btn" onClick={() => setSettings({ fontScale: nextFont })} aria-label={`字體大小：${fontLabel[fontScale]}（點擊切換為${fontLabel[nextFont]}）`} title={`字體：${fontLabel[fontScale]}`}>
            <AArrowUp className="h-5 w-5" aria-hidden />
          </button>
          <button className="icon-btn" onClick={() => setSettings({ theme: nextTheme })} aria-label={`主題：${themeLabel[theme]}（點擊切換為${themeLabel[nextTheme]}）`} title={`主題：${themeLabel[theme]}`}>
            <ThemeIcon className="h-5 w-5" aria-hidden />
          </button>
          <button
            className="icon-btn hidden xl:inline-flex"
            onClick={() => setSettings({ rightPanelOpen: !rightPanelOpen })}
            aria-label={rightPanelOpen ? '收合右側筆記面板' : '展開右側筆記面板'}
            aria-pressed={rightPanelOpen}
          >
            {rightPanelOpen ? <PanelRightClose className="h-5 w-5" aria-hidden /> : <PanelRightOpen className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>
      {/* 閱讀進度條 */}
      <div className="h-0.5 w-full bg-transparent" role="progressbar" aria-label="本頁閱讀進度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}
