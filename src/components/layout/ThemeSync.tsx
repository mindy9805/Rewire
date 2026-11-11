/** 將「主題」「字體大小」「動畫」設定同步到 <html>、朗讀聲音同步到朗讀模組，並監聽系統深色模式變化 */
import { useEffect } from 'react';
import { useStore } from '../../store/AppStore';
import { setPreferredVoice } from '../../lib/speech';

export default function ThemeSync() {
  const { theme, fontScale, motion, voiceURI } = useStore().data.settings;
  // 朗讀聲音：把使用者指定的聲音交給朗讀模組（空字串＝自動挑選台灣女聲）
  useEffect(() => setPreferredVoice(voiceURI), [voiceURI]);
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
