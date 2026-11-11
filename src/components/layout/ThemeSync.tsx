/** 將「主題」與「字體大小」設定同步到 <html>，並監聽系統深色模式變化 */
import { useEffect } from 'react';
import { useStore } from '../../store/AppStore';

export default function ThemeSync() {
  const { theme, fontScale } = useStore().data.settings;
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
  return null;
}
