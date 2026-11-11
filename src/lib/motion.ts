/**
 * 動畫偏好輔助：同時考慮「系統減少動態效果」與站內「關閉動畫」設定。
 * 站內設定由 ThemeSync 寫在 <html data-motion="reduce">，CSS 與這裡的 JS 判斷共用同一個來源。
 */

/** 目前是否應減少動畫（系統偏好或站內設定任一成立即為 true） */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  if (document.documentElement.dataset.motion === 'reduce') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** 程式捲動時使用的行為：減少動畫時直接跳到位置，否則平滑捲動 */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}
