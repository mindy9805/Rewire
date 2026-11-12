/** 網站進入點：掛載 React，並在正式環境註冊 Service Worker（PWA 離線使用） */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// 字型自架（不連到 Google Fonts，使用者的 IP 不會因載入字型而傳給第三方）。
// 中文字型已切成許多小檔，瀏覽器只會下載畫面上用到的字。
import '@fontsource-variable/noto-sans-tc';
import '@fontsource-variable/noto-serif-tc';
import '@fontsource-variable/playfair-display/wght.css';
import '@fontsource-variable/playfair-display/wght-italic.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* 註冊失敗不影響網站使用 */
    });
  });
}
