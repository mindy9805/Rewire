/** 九個章節的彙整與查詢工具 */
import type { Chapter, ChapterId } from '../types';
import { chaptersA } from './chapters-a';
import { chaptersB } from './chapters-b';
import { chaptersC } from './chapters-c';

export const chapters: Chapter[] = [...chaptersA, ...chaptersB, ...chaptersC];

export const chapterMap = Object.fromEntries(chapters.map((c) => [c.id, c])) as Record<ChapterId, Chapter>;

export function chapterLabel(id: ChapterId | 'general'): string {
  if (id === 'general') return '一般';
  const c = chapterMap[id];
  return c ? `第 ${c.number} 章｜${c.title}` : id;
}
