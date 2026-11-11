/**
 * 全站版型
 * - 桌機（lg 以上）：左側固定章節導覽＋中央閱讀區；xl 以上再顯示右側可收合的筆記／進度面板。
 * - 手機：單欄閱讀，章節導覽改為抽屜選單，底部固定主要功能導覽。
 * - 全站彩蛋：不在輸入框時用鍵盤打出 rewire，會出現提示與飄葉動畫。
 */
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import BottomNav from './BottomNav';
import MobileDrawer from './MobileDrawer';
import SearchDialog from './SearchDialog';
import StorageNotice from './StorageNotice';
import GrowthWatcher from '../play/GrowthWatcher';
import LeafBurst from '../play/LeafBurst';
import { useToast } from '../ui/Toast';
import { celebrate } from '../../lib/celebrate';
import { KEYWORD_EGG } from '../../content/play';
import { useStore } from '../../store/AppStore';

export default function Layout() {
  const { data } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const toast = useToast();
  const typed = useRef('');

  // 換頁時捲回頂端；若網址帶有 #sec-xxx 錨點則捲到該段落
  useEffect(() => {
    setDrawer(false);
    const anchor = hash.replace('#', '');
    if (anchor) {
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: 'start' }));
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  // 鍵盤快捷鍵：Ctrl/⌘ + K 或 / 開啟搜尋
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      // 彩蛋：記住最近輸入的英文字母，拼出 rewire 時給一個小驚喜（輸入框內打字不算）
      if (typing || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      typed.current = (typed.current + e.key.toLowerCase()).slice(-KEYWORD_EGG.word.length);
      if (typed.current === KEYWORD_EGG.word) {
        typed.current = '';
        toast(KEYWORD_EGG.message);
        celebrate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toast]);

  const rightOpen = data.settings.rightPanelOpen;

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-onaccent">
        跳到主要內容
      </a>
      <GrowthWatcher />
      <LeafBurst />
      <TopBar onMenu={() => setDrawer(true)} onSearch={() => setSearchOpen(true)} />
      <div className="flex">
        <Sidebar />
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16">
          <div className="mx-auto max-w-4xl">
            <StorageNotice />
            <Outlet />
          </div>
        </main>
        {rightOpen && <RightPanel />}
      </div>
      <BottomNav />
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
