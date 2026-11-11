/**
 * 日期工具：一律以「使用者本地時區」計算日期，避免跨時區造成日期錯位。
 */

/** 取得 YYYY-MM-DD 格式的本地日期字串 */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 由 ISO 時間字串取得本地日期鍵 */
export function isoToDateKey(iso: string): string {
  return toDateKey(new Date(iso));
}

/** 回傳最近 n 天（含今天）的日期鍵，由舊到新 */
export function lastNDays(n: number, today: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push(toDateKey(d));
  }
  return out;
}

/** 顯示用：2026/11/10（週二） */
export function formatDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return key;
  const date = new Date(y, m - 1, d);
  const w = '日一二三四五六'[date.getDay()];
  return `${y}/${m}/${d}（週${w}）`;
}

/** 顯示用：月/日 */
export function shortDate(key: string): string {
  const [, m, d] = key.split('-').map(Number);
  return `${m}/${d}`;
}

/** 顯示用：日期與時間 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 由就寢與起床時間（HH:mm）計算睡眠時數，可跨午夜 */
export function sleepHours(bed: string, wake: string): number {
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  if ([bh, bm, wh, wm].some((n) => Number.isNaN(n))) return 0;
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}
