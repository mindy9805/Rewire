// Break the Pattern 計算邏輯測試：確認依真實資料計算、無資料時不產生假結果
import { describe, expect, it } from 'vitest';
import { assessmentQuestions, patternHabits, challengeAction, challengeAffirmation } from '../content/breakPattern';
import { createEmptyData } from '../store/storage';
import { assessmentTrend, commitmentRate, commitmentWeek, environmentReflection, nextSmallSteps, scoreAssessment, spendingReflection, topTriggers } from './pattern';

const today = new Date(2026, 10, 10);

describe('內容完整性', () => {
  it('七個習慣、21 題評估（每個習慣三題）、每個習慣 14 天行動', () => {
    expect(patternHabits).toHaveLength(7);
    expect(assessmentQuestions).toHaveLength(21);
    for (const h of patternHabits) {
      expect(assessmentQuestions.filter((q) => q.habitId === h.id)).toHaveLength(3);
      expect(h.challengeActions).toHaveLength(14);
      expect(h.affirmationIds.length).toBeGreaterThan(0);
    }
  });
  it('輕量版行動與心智語句輪替', () => {
    const h = patternHabits[0];
    expect(challengeAction(h, 1, 'gentle')).toContain('輕量版');
    expect(challengeAffirmation(h, 1)).toBe(h.affirmationIds[0]);
    expect(challengeAffirmation(h, 2)).toBe(h.affirmationIds[1]);
  });
});

describe('評估計分', () => {
  it('依三題平均計算自我回報頻率', () => {
    const r = scoreAssessment({ a1: 5, a2: 4, a3: 3 });
    expect(r[0]).toMatchObject({ habitId: 'approval', avg: 4, label: '經常', answered: 3 });
    expect(r[1]).toMatchObject({ answered: 0, label: '未作答', avg: 0 });
  });
  it('變化趨勢依時間排序', () => {
    const t = assessmentTrend([
      { id: '2', date: '2026-11-09', answers: { a1: 1, a2: 1, a3: 1 }, priorityIds: [], createdAt: '2026-11-09T00:00:00Z' },
      { id: '1', date: '2026-11-01', answers: { a1: 3, a2: 3, a3: 3 }, priorityIds: [], createdAt: '2026-11-01T00:00:00Z' },
    ]);
    expect(t.map((r) => r['過度尋求認可'])).toEqual([3, 1]);
  });
});

describe('微承諾', () => {
  const logs = [
    { id: 'a', commitmentId: 'c', date: '2026-11-10', status: 'done' as const, reason: '', createdAt: '' },
    { id: 'b', commitmentId: 'c', date: '2026-11-09', status: 'missed' as const, reason: '加班', createdAt: '' },
    { id: 'c', commitmentId: 'c', date: '2026-10-01', status: 'done' as const, reason: '', createdAt: '' },
  ];
  it('最近七天統計', () => {
    const w = commitmentWeek(logs, 7, today);
    expect(w).toHaveLength(7);
    expect(w[6]).toEqual({ date: '2026-11-10', 完成: 1, 中斷: 0 });
    expect(commitmentRate(logs, today)).toEqual({ done: 1, total: 2, pct: 50 });
    expect(commitmentRate([], today)).toBeNull();
  });
});

describe('反思產生器', () => {
  it('消費檢視：不判定對錯，計算每次使用成本', () => {
    const r = spendingReflection({ price: 1200, reasons: ['need', 'seen'], usesPerMonth: 10, budget: 'yes', alternative: '' });
    expect(r.costPerUse).toBe(10);
    expect(r.social).toContain('如果沒有人看到');
    expect(JSON.stringify(r)).not.toMatch(/錯誤|不應該|浪費/);
  });
  it('環境盤點：反向題正確處理', () => {
    const r = environmentReflection({ express: 5, stress: 5, support: 1 });
    expect(r.strengths).toContain('我能自在表達想法');
    expect(r.attention).toEqual(expect.arrayContaining(['這段互動帶來持續的壓力', '我們能互相支持']));
  });
});

describe('儀表板資料', () => {
  it('空資料時沒有觸發情境與下一步', () => {
    const d = createEmptyData();
    expect(topTriggers(d)).toEqual([]);
    expect(nextSmallSteps(d)).toEqual([]);
  });
});
