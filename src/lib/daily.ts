/** 每日心智練習的共用工具 */
import { affirmations } from '../content/dailyRewire';
import type { AppData, DailyLog } from '../types';
import { toDateKey } from './date';
import { nowIso, uid } from './id';

/** 取得某日的紀錄；沒有則建立一筆尚未儲存的空白紀錄 */
export function getDailyLog(d: AppData, date = toDateKey()): DailyLog {
  const found = d.dailyLogs.find((l) => l.date === date);
  if (found) return found;
  const t = nowIso();
  return { id: uid(), date, completedReading: false, favoriteId: 0, why: '', action: '', mood: 0, moodWords: '', createdAt: t, updatedAt: t };
}

/** 七句話合併為可複製的文字 */
export function allAffirmationsText(): string {
  return ['每天唸這 7 句話 🧠', ...affirmations.map((a) => `${String(a.id).padStart(2, '0')}｜${a.text}`)].join('\n');
}
