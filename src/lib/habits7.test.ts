// 7 Habits 計算邏輯與內容完整性測試
import { describe, expect, it } from 'vitest';
import { h7Habits, planDays, recommendFor, recommendationRules, H7_STAGES, empathyScenarios } from '../content/habits7';
import { createEmptyData } from '../store/storage';
import { h7StageProgress, planProgress, quadrantDistribution, renewalRadar, selfCheckAverage, weekKey } from './habits7';

describe('內容完整性', () => {
  it('七個習慣都有十個面向的內容、3–5 題測驗、三題自我評估', () => {
    expect(h7Habits).toHaveLength(7);
    for (const h of h7Habits) {
      expect(h.definition.length).toBeGreaterThan(0);
      expect(h.situations.length).toBeGreaterThan(0);
      expect(h.misconceptions.length).toBeGreaterThan(0);
      expect(h.neuro.caution).toBeTruthy();
      expect(h.concepts.some((c) => c.source === 'covey')).toBe(true);
      expect(h.concepts.some((c) => c.source === 'tool')).toBe(true);
      expect(h.strategies.length).toBeGreaterThan(0);
      expect(h.reflections.length).toBeGreaterThan(0);
      expect(h.selfCheck).toHaveLength(3);
      expect(h.quiz.length).toBeGreaterThanOrEqual(3);
      expect(h.quiz.length).toBeLessThanOrEqual(5);
      expect(h.links.affirmationIds.length).toBeGreaterThan(0);
    }
    expect(H7_STAGES.flatMap((s) => s.habits)).toHaveLength(7);
  });
  it('21 天計畫：每個習慣三天、依序為理解／實驗／反思', () => {
    expect(planDays).toHaveLength(21);
    expect(planDays.map((d) => d.day)).toEqual(Array.from({ length: 21 }, (_, i) => i + 1));
    expect(planDays.slice(0, 3).map((d) => d.phase)).toEqual(['understand', 'experiment', 'reflect']);
  });
  it('同理模擬器每個選項都有五個面向分析', () => {
    for (const s of empathyScenarios) for (const o of s.options) expect(o.scores).toHaveLength(5);
  });
});

describe('推薦規則', () => {
  it('依需求文件的範例推薦', () => {
    expect(recommendFor(['approval']).habits).toEqual(['proactive', 'winwin']);
    expect(recommendFor(['promises']).habits).toEqual(['first']);
    expect(recommendFor(['solitude']).habits).toEqual(['end', 'renew']);
    expect(recommendFor([]).habits).toEqual([]);
    expect(recommendationRules).toHaveLength(7);
  });
});

describe('計算', () => {
  it('weekKey 回傳星期一', () => {
    expect(weekKey(new Date(2026, 10, 10))).toBe('2026-11-09'); // 週二
    expect(weekKey(new Date(2026, 10, 15))).toBe('2026-11-09'); // 週日
    expect(weekKey(new Date(2026, 10, 9))).toBe('2026-11-09'); // 週一
  });
  it('空資料不產生假進度', () => {
    const d = createEmptyData();
    expect(h7StageProgress(d).done).toBe(0);
    expect(planProgress(d)).toEqual({ done: 0, total: 21, started: false, nextDay: 1 });
    expect(renewalRadar(d, (x) => x).count).toBe(0);
    expect(selfCheckAverage({})).toBe(0);
  });
  it('四象限本週分布', () => {
    const t = (q: 1 | 2 | 3 | 4, due: string, done = false) => ({ id: Math.random().toString(), title: 'x', quadrant: q, due, done, note: '', createdAt: '2026-11-01T00:00:00Z', updatedAt: '' });
    const r = quadrantDistribution([t(2, '2026-11-12'), t(2, '2026-11-13', true), t(1, '2026-12-01')], new Date(2026, 10, 10));
    expect(r[1]).toEqual({ name: '第二象限', 進行中: 1, 已完成: 1 });
    expect(r[0].進行中).toBe(0);
  });
  it('階段進度', () => {
    const d = createEmptyData();
    d.h7Progress = { proactive: { status: 'done', startedAt: '' }, end: { status: 'learning', startedAt: '' }, renew: { status: 'done', startedAt: '' } };
    const p = h7StageProgress(d);
    expect(p.done).toBe(2);
    expect(p.stages[0]).toMatchObject({ done: 1, learning: 1, total: 3 });
    expect(p.stages[2]).toMatchObject({ done: 1, total: 1 });
  });
});
