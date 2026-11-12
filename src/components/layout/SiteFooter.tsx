/**
 * 全站頁尾：每個頁面都看得到的三件事——非官方、非醫療、求助資源。
 * 完整說明在「關於與聲明」頁（/about）。
 */
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <section className="mt-12 border-t border-line pt-5 text-xs leading-relaxed text-muted" aria-label="網站聲明">
      <p>
        Rewire 是個人製作、免費提供的學習與練習工具，<strong className="font-medium text-ink">非官方網站，與參考書籍的作者、出版社無關</strong>。<br />
        內容為自我成長與覺察練習，<strong className="font-medium text-ink">不具醫療、診斷或心理諮商功能</strong>，也不能保證任何效果。
      </p>
      <p className="mt-1.5">
        心裡很難受時，請找專業的人聊聊：安心專線 1925（24 小時免付費）、生命線 1995、張老師 1980；有立即危險請撥 119。
      </p>
      <p className="mt-1.5"><Link to="/about" className="underline hover:text-accent">關於與聲明（授權、隱私、免責）</Link></p>
    </section>
  );
}
