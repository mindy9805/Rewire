/**
 * 間隔回想：從「已經作答過、而且至少隔了一天」的章節測驗中，每天挑一題讓使用者回想。
 * - 學習研究中，間隔一段時間後主動回想，比重複閱讀更有助於記住內容（間隔效應、提取練習）。
 * - 只挑使用者自己做過的章節；每天固定同一題（依日期），換天才換。
 * - 回想不計分、不保存，可以直接跳過。
 */
import type { AppData, ChapterId, QuizQuestion } from '../types';
import { chapterMap } from '../content/chapters';
import { dailyPick } from './activity';
import { toDateKey } from './date';

export interface RecallItem { chapterId: ChapterId; chapterNo: number; chapterTitle: string; q: QuizQuestion }

/** 至少間隔多少天才拿出來回想 */
export const RECALL_GAP_DAYS = 1;

export function todaysRecall(d: AppData, now = new Date()): RecallItem | null {
  const cutoff = now.getTime() - RECALL_GAP_DAYS * 86400000;
  const eligible = (Object.entries(d.quizzes) as [ChapterId, NonNullable<AppData['quizzes'][ChapterId]>][])
    .filter(([id, r]) => chapterMap[id] && new Date(r.submittedAt).getTime() <= cutoff)
    .map(([id]) => id)
    .sort();
  if (!eligible.length) return null;
  const date = toDateKey(now);
  const id = dailyPick(eligible, 7, date);
  const ch = chapterMap[id];
  return { chapterId: id, chapterNo: ch.number, chapterTitle: ch.title, q: dailyPick(ch.quiz, 11, date) };
}
