// 共用活動紀錄與解鎖規則測試：不重複計算、空資料不產生假收藏、規則正確
import { describe, expect, it } from 'vitest';
import { createEmptyData } from '../store/storage';
import { activitySummary, collectActivity, computeUnlocks, dailyPick, growthPoints } from './activity';
import { moodCards, quests, socialStories, wheelItems, badges, plants } from '../content/play';

describe('內容不會出現空白', () => {
  it('所有卡片、冒險、劇場、轉盤項目都有內容', () => {
    expect(moodCards.every((c) => c.text.trim())).toBe(true);
    for (const t of ['affirmation', 'micro', 'question', 'fact', 'reminder']) expect(moodCards.some((c) => c.type === t)).toBe(true);
    for (const q of quests) for (const d of ['short', 'medium', 'long'] as const) expect(q.depths[d].trim()).not.toBe('');
    for (const s of socialStories) {
      expect(s.options.length).toBeGreaterThanOrEqual(2);
      expect(s.options.length).toBeLessThanOrEqual(4);
      for (const o of s.options) expect([o.outcome, o.pros, o.limits].every((x) => x.trim())).toBe(true);
    }
    expect(wheelItems).toHaveLength(7);
    expect(badges.length).toBeGreaterThanOrEqual(7);
    expect(plants[0].points).toBe(0);
  });
  it('七句心智語句原文保留', () => {
    expect(moodCards.filter((c) => c.type === 'affirmation').map((c) => c.text)).toEqual(['我現在是安全的', '我的大腦可以改變', '我已經足夠好了', '犯錯是我成長的方式', '我的想法不等於事實', '我的存在很重要', '今天是新的機會']);
  });
});

describe('活動紀錄', () => {
  it('空資料：沒有活動、只解鎖起始植物與景觀', () => {
    const d = createEmptyData();
    const ev = collectActivity(d);
    expect(ev).toEqual([]);
    const u = computeUnlocks(d, ev);
    expect(Object.keys(u).sort()).toEqual(['plant:sprout', 'theme:spring']);
  });
  it('同一筆紀錄只算一次（編輯不重複計算）', () => {
    const d = createEmptyData();
    d.questLogs = [{ id: 'q1', questId: 'ask', depth: 'short', date: '2026-11-10', note: '', createdAt: '2026-11-10T01:00:00Z' }];
    d.dailyLogs = [{ id: 'd', date: '2026-11-10', completedReading: true, favoriteId: 0, why: '', action: '', mood: 0, moodWords: '', createdAt: '', updatedAt: '' }];
    expect(growthPoints(collectActivity(d))).toBe(2);
    d.questLogs[0] = { ...d.questLogs[0], note: '編輯後' };
    expect(growthPoints(collectActivity(d))).toBe(2);
  });
  it('徽章規則：勇敢提問者、好奇探索家、小卡收藏家', () => {
    const d = createEmptyData();
    d.questLogs = [{ id: 'q1', questId: 'ask', depth: 'short', date: '2026-11-08', note: '', createdAt: '2026-11-08T01:00:00Z' }];
    d.journal = [{ id: 'j', date: '2026-11-09', title: '', content: 'x', mood: 0, tags: [], createdAt: '2026-11-09T01:00:00Z', updatedAt: '' }];
    d.emotionLogs = [{ id: 'e', core: '平靜', word: '安心', intensity: 3, note: '', createdAt: '2026-11-10T01:00:00Z' }];
    d.savedCards = ['a', 'b', 'c'].map((id, i) => ({ id, cardId: 'a1', createdAt: `2026-11-1${i}T01:00:00Z` }));
    const u = computeUnlocks(d);
    expect(u['badge:question'].date).toBe('2026-11-08');
    expect(u['badge:curious'].date).toBe('2026-11-10');
    expect(u['badge:collector'].date).toBe('2026-11-12');
    expect(u['plant:clover']).toBeTruthy();
    expect(u['badge:reader']).toBeUndefined();
  });
  it('重新開始者：微承諾中斷後再完成', () => {
    const d = createEmptyData();
    d.commitmentLogs = [
      { id: '1', commitmentId: 'c', date: '2026-11-05', status: 'missed', reason: '', createdAt: '' },
      { id: '2', commitmentId: 'c', date: '2026-11-06', status: 'done', reason: '', createdAt: '' },
    ];
    expect(computeUnlocks(d)['badge:restart'].date).toBe('2026-11-06');
  });
  it('統計與每日推薦', () => {
    const d = createEmptyData();
    d.questLogs = [{ id: 'q1', questId: 'ask', depth: 'short', date: '2026-11-08', note: '', createdAt: '2026-11-08T01:00:00Z' }];
    const s = activitySummary(collectActivity(d));
    expect(s.topTheme).toEqual(['play', 1]);
    expect(dailyPick([1, 2, 3], 0, '2026-11-10')).toBe(dailyPick([1, 2, 3], 0, '2026-11-10'));
  });
});
