/** 將「主題」「字體大小」「動畫」設定同步到 <html>，並監聽系統深色模式變化 */
import { useEffect } from 'react';
import { useStore } from '../../store/AppStore';

export default function ThemeSync() {
  const { theme, fontScale, motion } = useStore().data.settings;
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.font = fontScale;
  }, [fontScale]);
  // 站內關閉動畫：加上 data-motion="reduce"；跟隨系統時移除，交給 CSS 媒體查詢判斷
  useEffect(() => {
    if (motion === 'reduce') document.documentElement.dataset.motion = 'reduce';
    else delete document.documentElement.dataset.motion;
  }, [motion]);
  return null;
}
